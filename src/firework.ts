
import util = module("util");
import animation = module("animation");
import gl = module("gameLib");

export interface ObjectBase {
    // オブジェクトが有効であるかを返す。
    // isValidがfalseを返す場合、このオブジェクトはそのフレームで取り除かれる。
    isValid(): bool;
}

// オブジェクトの種別を表す
enum ObjectType {
    Wall,
    Star
}

// オブジェクトの状態を表す
enum ObjectState {
    Connected,
    Free,
    PrepareLaunch,
    Launch
}

// B2BodyのuserDataに登録する情報
class ObjectInfo {
    objectState: ObjectState;
    constructor(public type: ObjectType) { this.objectState = ObjectState.Free; }
}

// Starで利用されている各種情報
module StarUtil {

    enum StarSize {
        Large,
        Medium,
        Small,
        VerySmall
    }

    // StarSizeからランダムでいずれかを取得する
    function getSomeType(): StarSize {
        switch (Math.floor(Math.random() * 4)) {
            case 0: return StarSize.Large;
            case 1: return StarSize.Medium;
            case 2: return StarSize.Small;
            case 3: return StarSize.VerySmall;
        }
    }

    export function getSomeSize(): number {
        switch (getSomeType()) {
            case StarSize.Large: return 16;
            case StarSize.Medium: return 14;
            case StarSize.Small: return 12;
            case StarSize.VerySmall: return 10;
        }
    }
}

export interface IStar extends gl.Entity, gl.Physics.BodyBindable, ObjectBase {
    setColor(color: animation.Common.Color): void;
}

// メインのオブジェクトとなるStar
export class Star extends gl.BaseClasses.EntityImpl implements IStar {
    body: B2Body;
    private _circle: animation.Shapes.Circle;

    // 各starで共通するFixtureDefinition
    static private _fixDef = (): B2FixtureDef => {
        var fix = new Box2D.Dynamics.b2FixtureDef();
        fix.density = 1.0;       // 密度
        fix.friction = 1.5;      // 摩擦係数
        fix.restitution = 0.2;   // 反発係数
        return fix;
    } ();

    private _color: animation.Common.Color = new animation.Common.Color();

    // 必要なパラメータを同期させる
    private syncParam(): void {
        this._circle.x = this.x;
        this._circle.y = this.y;
        this.width = this._circle.width;
        this.height = this._circle.height;
        this._circle.zIndex = this.zIndex;
    }

    constructor() {
        super();
        this._circle = new animation.Shapes.Circle(StarUtil.getSomeSize());
        this.syncParam();
    }

    isValid(): bool {
        return true;
    }

    setColor(color: animation.Common.Color): void {
        this._color = color;
    }

    // bodyからデータを反映させる際に呼び出されるコールバック
    onreflect(): bool {
        var body = this.body;
        var count = 0;
        var contacts = [];
        for (var n = body.GetContactList(); n != null;
             n = n.next) {
            if (n.contact.IsTouching()) {
                contacts.push(n.other);
            }
        }
        // 星同士が4つ以上隣接したら、staticに変更する。
        if (contacts.length >= 4) {
            contacts.forEach((e) => {
                var info: ObjectInfo = e.GetUserData();
                info.objectState = ObjectState.Connected;
                if (body != e && info.type == ObjectType.Star) {
                    e.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                }
            });
            body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
            var info: ObjectInfo = body.GetUserData();
            info.objectState = ObjectState.Connected;
        }
        return true;
    }

    // starをレンダリングする。レンダリング処理自体は、circleのrenderに任せる。
    render(context: animation.Context): void {
        var r = this._circle.radius;
        var grad = new animation.Gradietion.Radial(context);
        grad.from(this.x + r * 0.7, this.y + r * 0.5, 1).to(this.x + r, this.y + r, r);
        var info: ObjectInfo = this.body.GetUserData();

        // 連結している場合は、灰色ベースの色にしてしまう
        if (info.objectState == ObjectState.Connected) {
            grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").colorStop(1.0, "#000");
        } else {
            grad.colorStop(0.0, "#fff").colorStop(0.5, this._color.toFillStyle()).
                colorStop(1.0, "#000");
        }
        this.syncParam();
        this._circle.gradient = grad;
        this._circle.render(context);
    }

    // 渡されたstarに適合するbodyの設定を作成する。
    static createFixture(target: IStar, scale: number): gl.Physics.BodyDefinition {
        var fixDef = this._fixDef;
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.userData = new ObjectInfo(ObjectType.Star);
        bodyDef.position.Set((target.x + target.width / 2) / scale,
                             (target.y + target.height / 2) / scale);
        bodyDef.angularVelocity = (Math.random() * 2 % 2 ? -1 : 1) * 10;
        fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(target.width / 2 / scale);
        console.log(target.width / 2);
        return { bodyDef: bodyDef, fixtureDef: fixDef };
    }
}

export interface IStarCase extends gl.Entity, gl.Physics.BodyBindable {}

export class StarCaseOption {
    // 左右両壁の幅
    sideWallThickness: number = 10;

    // 地面の厚み
    groundThickness: number = 10;
}

// width / heightにあてはまるオブジェクトを生成する。
export class StarCase {
    // 左側の境界位置
    leftBound: number;
    // 右側の境界位置
    rightBound: number;
    // 地面の境界位置
    groundBound: number;

    walls: gl.Entity[] = [];
    wallShapes: gl.Physics.BodyDefinition[] = [];

    constructor(public width: number, public height: number) { }

    initialize(scale: number, option? = new StarCaseOption): void {
        var sideThick = option.sideWallThickness,
        ground = option.groundThickness;
        this.walls.push(this.createWall(0, 0, sideThick, this.height));
        this.walls.push(this.createWall(this.width - sideThick, 0, sideThick, this.height));
        this.walls.push(this.createWall(0, this.height - ground, this.width, ground));

        // ここで作成される剛体は、見ためのSpriteの倍に相当する剛体とする
        this.wallShapes.push(
            this.createShape(scale, -sideThick, 0, sideThick * 2, this.height * 2));
        this.wallShapes.push(
            this.createShape(scale, this.width - sideThick, 0, sideThick * 2, this.height * 2));
        this.wallShapes.push(
            this.createShape(scale, 0, this.height - ground, this.width * 2, ground * 2));

        this.leftBound = sideThick;
        this.rightBound = this.width - sideThick;
        this.groundBound = this.height - ground;
    }

    // 壁に相当するspriteを作る
    private createWall(x: number, y: number, w: number, h: number): gl.Entity {
        var p = new animation.Shapes.Box(w, h);
        p.x = x;
        p.y = y;
        return new gl.BaseClasses.EntityProxy(p);
    }

    // 壁に相当する剛体を作る。
    private createShape(scale: number, x: number, y: number, w: number, h: number): gl.Physics.BodyDefinition {
        var b2BodyDef = Box2D.Dynamics.b2BodyDef
        , b2Body = Box2D.Dynamics.b2Body
        , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 1.5;
        fixDef.restitution = 0.2;

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.Set((x + w / 2) / scale, (y + h / 2) / scale);
        bodyDef.userData = new ObjectInfo(ObjectType.Wall);
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(w / scale / 2, h / scale / 2);
        return { bodyDef: bodyDef, fixtureDef: fixDef };
    }

}