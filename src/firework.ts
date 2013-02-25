
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
    Free,
    Connected,
    Touched,
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
}

export module GameObj {

    // 各starで共通するFixtureDefinition
    var _fixDef = (): B2FixtureDef => {
        var fix = new Box2D.Dynamics.b2FixtureDef();
        fix.density = 1.0;       // 密度
        fix.friction = 1.5;      // 摩擦係数
        fix.restitution = 0.2;   // 反発係数
        return fix;
    } ();

    // Starに係るロジック周辺の処理を担当する。
    // StarLogic自体はStarにコンポジションされているが、
    // StarLogicにもStarが渡されている。
    class StarLogic {

        _state: ObjectInfo = new ObjectInfo(ObjectType.Star);
        _scale: number = 1;

        constructor(public starShape:Star) {}

        onreflect(): bool {
            var body = this.starShape.body;
            var count = 0;
            var contacts = [];
            for (var n = body.GetContactList(); n != null;
                 n = n.next) {
                if (n.contact.IsTouching()) {
                    contacts.push(n.other);
                }
            }
            // 星同士が4つ以上隣接したら、staticに変更する。
            if (contacts.length >= 4 && this.isConnectable()) {
                contacts.filter((e) => {
                    var info_e: ObjectInfo = e.GetUserData();
                    return info_e.objectState == ObjectState.Free;
                }).forEach((e) => {
                    var info_e: ObjectInfo = e.GetUserData();
                    info_e.objectState = ObjectState.Connected;
                    if (body != e && info_e.type == ObjectType.Star) {
                        e.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                    }
                });
                body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                var info: ObjectInfo = body.GetUserData();
                info.objectState = ObjectState.Connected;
                return false;
            }

            return true;
        }

        isConnectable() : bool {
            return this._state.objectState === ObjectState.Free;
        }

        // タッチを開始した際の処理。
        ontouchstart(scene: gl.Scene, e:Event) : bool {
            var s = this.starShape;
            if (this._state.objectState !== ObjectState.PrepareLaunch) {
                s.x -= s.width;
                s.y -= s.height;
                s.radius *= 2;
                s.width *= 2;
                s.height *= 2;
                s.baseColor.a = 0.3;
                this._state.objectState = ObjectState.PrepareLaunch;
            }
            return true;
        }

        // タッチして離されたとき、その時点での領域にかかっている星を
        // 消して、自身を拡大する。
        ontouchend(scene: gl.Scene, e:Event) : bool {
            if (this._state.objectState === ObjectState.PrepareLaunch) {
                return false;
            }
            var s = <gl.Entity>this.starShape;
            var contain = scene.entities.filter((elem) => {
                if (elem === s) return false;
                var distance = this.starShape.radius * 2;
                return this.starShape.within(elem, distance);
            });

            contain.forEach((elem) => {
                scene.removeEntity(elem);
            });

            // 剛体の情報を更新する。
            var s = this.starShape;
            s.x -= s.radius;
            s.y -= s.radius;
            s.radius *= 2;
            s.width *= 2;
            s.height *= 2;

            s.body.SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
            s.body.DestroyFixture(s.body.GetFixtureList());
            var fixDef = this._fixDef;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(s.radius / this._scale);
            s.body.CreateFixture(fixDef);

            // 準備段階は終了とする
            this._state.objectState = ObjectState.PrepareLaunch;
            return true;
        }

    }

    // メインのオブジェクトとなるStar
    export class Star extends gl.BaseClasses.EntityImpl implements IStar {

        private _logic : StarLogic;

        body: B2Body;

        set color(col:animation.Common.Color) { this._circle.baseColor = col;}

        constructor() {
            super(StarUtil.getSomeSize());
            this._starLogic = new StarLogic(this)
        }

        isValid(): bool {
            return true;
        }

        isConnectable() : bool {this._logic.isConnectable();}

        // bodyからデータを反映させる際に呼び出されるコールバック
        onreflect(): bool { return this._logic.onreflect();}

        // starをレンダリングする。レンダリング処理自体は、circleのrenderに任せる。
        render(context: animation.Context): void {
            var r = this._circle.radius;
            var grad = new animation.Gradietion.Radial(context);
            grad.from(this.x + r * 0.7, this.y + r * 0.5, 1).to(this.x + r, this.y + r, r);
            var info: ObjectInfo = this.body.GetUserData();

            // 連結している場合は、灰色ベースの色にしてしまう
            switch (this._state.objectState) {
            case ObjectState.Connected:
                grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").colorStop(1.0, "#000");
                break;
            case ObjectState.PrepareLaunch:
                grad.colorStop(0.0, this._circle.baseColor.toFillStyle()).colorStop(1.0, this._circle.baseColor.toFillStyle());
                break;
            default:
                grad.colorStop(0.0, "#fff").colorStop(0.5, this._circle.baseColor.toFillStyle()).
                    colorStop(1.0, "#000");
            }
            this.syncParam();
            this._circle.gradient = grad;
            this._circle.render(context);
        }

        // 渡されたstarに適合するbodyの設定を作成する。
        createFixture(scale: number): gl.Physics.BodyDefinition {
            var fixDef = this._fixDef;
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.userData = this._state;
            bodyDef.position.Set((this.x + this.width / 2) / scale,
                                 (this.y + this.height / 2) / scale);
            bodyDef.angularVelocity = (Math.random() * 2 % 2 ? -1 : 1) * 10;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.width / 2 / scale);

            this._logic._scale = scale;
            return { bodyDef: bodyDef, fixtureDef: fixDef };
        }

        // ontouchstartのハンドラを作成して返す。
        makeTouchStartHandler(scene: gl.Scene) : (e:Event) => bool {
            return (e:Event) => {
                this._logic.ontouchstart(scene, e);
            }
        }

        // ontouchendのハンドラを作成して返す
        makeTouchEndHandler(scene: gl.Scene): (e: Event) => bool {
            return (e: Event) => {
                this._logic.ontouchend(scene, e);
            }
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

}