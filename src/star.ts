
import util = module("util");
import animation = module("animation");
import gl = module("gameLib");
import fw = module("firework");
import I = util.Illiegals
import starmine = module("starmine");

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

// Starに係るロジック周辺の処理を担当する。
// StarLogic自体はStarにコンポジションされているが、
// StarLogicにもStarが渡されている。
class StarLogic {

    // 各starで共通するFixtureDefinition
    private _fixDef = (): B2FixtureDef => {
        var fix = new Box2D.Dynamics.b2FixtureDef();
        fix.density = 1.0;       // 密度
        fix.friction = 1.5;      // 摩擦係数
        fix.restitution = 0.2;   // 反発係数
        return fix;
    } ();

    state: fw.ObjectInfo = new fw.ObjectInfo(fw.ObjectType.Star);
    scale: number = 1;

    constructor(public starShape: Star, public data: animation.Renderer.Circle.Data) { }

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
                var info_e: fw.ObjectInfo = e.GetUserData();
                return info_e.objectState == fw.ObjectState.Free;
            }).forEach((e) => {
                var info_e: fw.ObjectInfo = e.GetUserData();
                info_e.objectState = fw.ObjectState.Connected;
                if (body != e && info_e.type == fw.ObjectType.Star) {
                    e.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                }
            });
            body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
            var info: fw.ObjectInfo = body.GetUserData();
            info.objectState = fw.ObjectState.Connected;
            return false;
        }

        return true;
    }

    isConnectable(): bool {
        return this.state.objectState === fw.ObjectState.Free;
    }

    // タッチを開始した際の処理。
    ontouchstart(scene: gl.Scene, e: Event): bool {
        var s = this.starShape;
        if (this.state.objectState === fw.ObjectState.Connected) {
            s.x -= s.width;
            s.y -= s.height;
            this.data.radius *= 2;
            s.width *= 2;
            s.height *= 2;
            this.data.color.a = 0.3;
            this.state.objectState = fw.ObjectState.Touched;
        }
        return true;
    }

    // タッチして離されたとき、その時点での領域にかかっている星を
    // 消して、自身を拡大する。
    // ただし、領域内に、すでにLaunch状態になっているものがある場合は
    // 元に戻る。
    ontouchend(scene: gl.Scene, e: Event): bool {

        if (this.state.objectState !== fw.ObjectState.Touched) {
            return false;
        }

        var s = this.starShape;
        var contain = scene.entities.filter((elem) => {
            if (elem === s) return false;
            return s.within(elem, this.data.radius);
        });

        // 広がった中に存在しなければ、大きさを元に戻す。
        if (contain.length === 0) {
            this.data.radius /= 2;
            s.width /= 2;
            s.height /= 2;
            this.state.objectState = fw.ObjectState.Connected;
            return false;
        }

        contain.forEach((elem) => {scene.removeEntity(elem);});

        // 剛体の情報を更新する。
        s.body.SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
        s.body.DestroyFixture(s.body.GetFixtureList());
        var fixDef = this._fixDef;
        fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.data.radius / this.scale);
        s.body.CreateFixture(fixDef);

        // 準備段階は終了とする
        this.state.objectState = fw.ObjectState.PrepareLaunch;

        var baseColor = new animation.Common.Color();
        baseColor.copy(this.data.color);
        this.data.color.r = 255;
        this.data.color.g = 40;
        this.data.color.b = 40;
        var ratio = 128 / gl.Game.instance.fps;

        var downFunc = () => {
            this.data.color.r -= ratio;
            this.data.color.r = Math.floor(this.data.color.r);
            if (this.data.color.r <= 128) {
                this.data.color.r = 128;
            }
        };
        var upFunc = () => {
            this.data.color.r += ratio;
            this.data.color.r = Math.floor(this.data.color.r);
            if (this.data.color.r >= 255) {
                this.data.color.r = 255;
            }
        };
        
        this.starShape.tl.repeat(gl.Game.instance.fps, downFunc)
            .repeat(gl.Game.instance.fps, upFunc)
            .repeat(gl.Game.instance.fps, downFunc)
            .repeat(gl.Game.instance.fps, upFunc)
            .then(() => {
                var mine = new starmine.StarMineImpl(this.starShape.x + this.data.radius,
                                                     this.starShape.y + this.data.radius,
                                                     baseColor);
                mine.enableCorrect = false;
                this.starShape.scene.addEntity(mine);
                mine.setup();

                this.starShape.scene.removeEntity(this.starShape);
            });
        return true;
    }

    // 渡されたstarに適合するbodyの設定を作成する。
    createFixture(scale: number): gl.Physics.BodyDefinition {
        var fixDef = this._fixDef;
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.userData = this.state;
        bodyDef.position.Set((this.data.x + this.data.width / 2) / scale,
                             (this.data.y + this.data.height / 2) / scale);
        bodyDef.angularVelocity = (Math.random() * 2 % 2 ? -1 : 1) * 10;
        fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.data.width / 2 / scale);

        this.scale = scale;
        return { bodyDef: bodyDef, fixtureDef: fixDef };
    }

}

module Renderer {

    // 通常状態のStarをレンダリングする。
    class NormalStarRenderer implements animation.Renderable {

        private _renderer : animation.Renderer.Circle.CircleRenderer;

        constructor(public data: animation.Renderer.Circle.Data) {
            this._renderer = new animation.Renderer.Circle.CircleRenderer(this.data);
        }

        render(context:animation.Context) : void {
            var r = this.data.radius;
            var d = this.data;
            var grad = new animation.Gradation.Radial(context);
            grad.from(d.x + r * 0.7, d.y + r * 0.5, 1).to(d.x + r, d.y + r, r);

            grad.colorStop(0.0, "#fff").colorStop(0.5, d.color.toFillStyle()).
                colorStop(0.9, "#000").
                colorStop(1.0, "#333");

            d.gradient = grad;
            this._renderer.render(context);
        }
    }

    // 連結状態のStarをレンダリングする。
    class ConnectedStarRenderer implements animation.Renderable {

        private _renderer : animation.Renderer.Circle.CircleRenderer;

        constructor(public data: animation.Renderer.Circle.Data) {
            this._renderer = new animation.Renderer.Circle.CircleRenderer(this.data);
        }

        render(context:animation.Context) : void {
            var r = this.data.radius;
            var d = this.data;
            var grad = new animation.Gradation.Radial(context);
            grad.from(d.x + r * 0.7, d.y + r * 0.5, 1).to(d.x + r, d.y + r, r);

            grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").
                colorStop(0.9, "#000").
                colorStop(1.0, "#333");
            d.gradient = grad;
            this._renderer.render(context);
        }
    }

    // PrepareLaunch状態のレンダリングを行う。
    class PrepareLaunchRenderer implements animation.Renderable {

        private _renderer : animation.Renderer.Circle.CircleRenderer;

        constructor(public data: animation.Renderer.Circle.Data) {
            this._renderer = new animation.Renderer.Circle.CircleRenderer(this.data);
        }

        render(context:animation.Context) : void {
            var r = this.data.radius;
            var d = this.data;
            var grad = new animation.Gradation.Radial(context);
            grad.from(d.x + r * 0.7, d.y + r * 0.5, 1).to(d.x + r, d.y + r, r);

            grad.colorStop(0.0, d.color.toFillStyle())
                .colorStop(1.0, d.color.toFillStyle());
            this.data.gradient = grad;
            this._renderer.render(context);
        }
    }

    // Starで利用するrenderの切り替えをコントロールするためのクラス
    export class StarRenderController {

        private _renderStock: {state: fw.ObjectState; render: animation.Renderable;}[];

        constructor(public data : animation.Renderer.Circle.Data) {
            this._renderStock = []

            this._renderStock.push({
                state : fw.ObjectState.Free, render : new NormalStarRenderer(data)
            });
            this._renderStock.push({
                state : fw.ObjectState.Touched, render : new NormalStarRenderer(data)
            });
            this._renderStock.push({
                state : fw.ObjectState.Connected, render : new ConnectedStarRenderer(data)
            });
            this._renderStock.push({
                state : fw.ObjectState.PrepareLaunch, render : new PrepareLaunchRenderer(data)
            });
        }

        getRenderer(state:fw.ObjectState) : animation.Renderable {
            var render = this._renderStock.filter((elem) => {
                return elem.state === state
            });

            return render.length === 0 ? new animation.NullRenderable : render[0].render;
        }
    }
}

// メインのオブジェクトとなるStar
export class Star extends gl.BaseClasses.EntityImpl implements fw.GameObj.IStar {

    private _logic: StarLogic;
    private _controller: Renderer.StarRenderController;

    body: B2Body;
    private data: animation.Renderer.Circle.Data;

    color:animation.Common.Color;

    constructor() {
        super();
        this.data = new animation.Renderer.Circle.Data(0, 0, StarUtil.getSomeSize());
        this._controller = new Renderer.StarRenderController(this.data);

        this._logic = new StarLogic(this, this.data);

        // バインドしておく
        I.propBind([I.binder("x"), I.binder("y"), I.binder("zIndex"),
                    I.binder("width"), I.binder("height"),
                    I.binder("visible"), I.binder("color")], this, this.data);
    }

    isValid(): bool {
        return true;
    }

    isConnectable(): bool { return this._logic.isConnectable(); }

    // bodyからデータを反映させる際に呼び出されるコールバック
    onreflect(): bool { return this._logic.onreflect(); }

    // starをレンダリングする。レンダリング処理自体は、circleのrenderに任せる。
    render(context: animation.Context): void {

        this._controller.getRenderer(this._logic.state.objectState).render(context);
    }

    createFixture(scale: number): gl.Physics.BodyDefinition {
        return this._logic.createFixture(scale);
    }

    // ontouchstartのハンドラを作成して返す。
    makeTouchStartHandler(scene: gl.Scene): (e: Event) => bool {
        return (e: Event) => {
            return this._logic.ontouchstart(scene, e);
        }
    }

    // ontouchendのハンドラを作成して返す
    makeTouchEndHandler(scene: gl.Scene): (e: Event) => bool {
        return (e: Event) => {
            return this._logic.ontouchend(scene, e);
        }
    }
}