/// <reference path='../lib/Box2dWeb.d.ts' />

import util = module("util");
import animation = module("animation");

// フレームベースでの更新処理を提供するゲームクラス。レンダリングが呼び出されるタイミング
// についても、ここで指定したフレームのタイミングとなる
export class Game {

    // デフォルトのFPS
    private _fps: number = 30;
    // FPSにおける各フレームに入った段階で実行される関数
    private _onenterframe: (game: Game) => void = null;
    private _onload: (game: Game) => void = null;
    private _ontouch: (game:Game, event:MouseEvent) => void = null;
    private _intervalHandle: number;
    private _isGameStarted: bool = false;

    // 内部で動作させるentity
    private _entities: animation.Entity[] = [];

    // 内部で作成するcanvasのID
    private _gameCanvasId: string = "game-canvas";
    private _engine: animation.RenderingEngine;
    get fps(): number { return this._fps; }
    set fps(f: number) { this._fps = f; }
    set onEnterFrame(f: (game: Game) => void ) { this._onenterframe = f; }
    set onload(f: (game: Game) => void ) { this._onload = f;}

    set ontouch(f:(game:Game,event:MouseEvent) => void) {this._ontouch = f;}

    constructor(public width: number, public height: number) {

        // レンダリング対象となるCanvasを追加する
        var elem = document.createElement("canvas");
        elem.id = this._gameCanvasId;
        elem.setAttribute("width", width.toString());
        elem.setAttribute("height", height.toString());
        document.body.appendChild(elem);
        // タッチ/マウスでそれぞれ同一のハンドラを利用する
        elem.addEventListener("touchstart", (e:MouseEvent) => {
            if (this._ontouch != null) {
                this._ontouch(this, e);
            }
        });
        elem.addEventListener("click", (e:MouseEvent) => {
            if (this._ontouch != null) {
                this._ontouch(this, e);
            }
        });

        this._engine = new animation.RenderingEngine(this._gameCanvasId);
    }

    /**
     * ゲームループを開始する。
     */
    start(): void {
        if (this._isGameStarted) {
            return;
        }

        if (this._onload) {
            this._onload(this);
        }

        this._intervalHandle = window.setInterval(() => {
            if (this._onenterframe) {
                this._onenterframe(this);
            }

            this.render();

        }, 1000 / this._fps);
        this._isGameStarted = true;
    }

    /**
     * 開始されたゲームループを停止する。
     */
    stop(): void {
        window.clearInterval(this._intervalHandle);
        this._intervalHandle = null;
        this._isGameStarted = false;
    }

    /**
     * 管理対象のentityを追加する
     */
    addEntity(entity: animation.Entity): void {
        this._entities.push(entity);
        this._engine.addEntity(entity);
    }

    /**
     * 指定されたEntityを削除する
     */
    removeEntity(entity: animation.Entity): void {
        var index = this._entities.indexOf(entity);
        this._entities.splice(index, 1);
    }

    private render() : void {
        this._engine.renderEntities();
    }
}

export module Physics {
    export class World {
        private _world: B2World;
        private _worldScale: number = 100;
        private _binders: BodyBinder[] = [];
        get worldScale() :number {return this._worldScale;}

        get gravity() :B2Vec2 {return this._world.GetGravity();}
        set gravity(vec) {return this._world.SetGravity(vec);}

        constructor(gravity:B2Vec2, sleep=true) {
            this._world = new Box2D.Dynamics.b2World(gravity, sleep);
        }

        // 渡されたbinderを登録する。binderがまだbindされていない場合、
        // 自身をbindの引数としてから登録する。
        add(binder:BodyBinder) : void {
            if (!binder.binded) {
                binder.bind(this);
            }
            this._binders.push(binder);
        }

        // 指定したBodyDefに基づいたBodyを追加し、追加したBodyを返す。
        addBody(def: BodyDefinition) : B2Body {
            var body = this._world.CreateBody(def.bodyDef);
            body.CreateFixture(def.fixtureDef);
            return body;
        }

        // 指定したtargetを持つadapterを削除する。
        remove(target:BodyBinder) : void {
            this._binders = this._binders.filter((value, index, array) => {
                array[index] != target
            });
        }

        // 指定したBodyを環境から取り除く。
        removeBody(body: B2Body) :void {
            this._world.DestroyBody(body);
        }

        // 物理世界の状況を更新する。
        step(rate:number, velocity:number, position:number) :void {

            this._world.Step(rate, velocity, position);
            this._world.ClearForces();
            this._binders.forEach((value, index, ary) => {
                ary[index].reflectBodyState(this._worldScale);
            });
        }
    }

    // BodyBindableとBodyをbindするクラス。
    // 実際にはBodyDefinitionのみを渡し、body生成はbindメソッドの呼び出し時に、
    // 渡されたworldについて行う。
    // Worldによって更新されたBodyの状態を、BodyBindableに反映する。
    export class BodyBinder {
        // すでにbody生成が行なわれている場合はtrue
        private _binded = false;
        private _target : BodyBindable;
        private _bodyDef : BodyDefinition;
        private _body  : B2Body;
        get binded() : bool {return this._binded;}
        get target() : BodyBindable {return this._target;}
        get body(): B2Body {return this._body;}

        constructor(target:BodyBindable, bodyDef: BodyDefinition) {
            this._target = target;
            this._bodyDef = bodyDef;
        }

        // 渡されたbodyDefinitonからbodyを生成し、生成したBodyと
        // オブジェクトを結びつける。
        bind(world:World) :void {
            if (!this._binded) {
                this._body = world.addBody(this._bodyDef);
                this._target.body = this._body;
                this._binded = true;
            }
        }

        // Bodyの現在の位置をtargetに反映する。
        // worldScaleは、Bodyの位置・サイズを1として、pixelに変換する際の係数。
        // 1 meter / 100 pixelならば、100とする。
        reflectBodyState(worldScale: number) : void {
            var bodyPos = this._body.GetPosition()
            ,me = this._target;

            if (me.onreflect()) {
                // 剛体の座標は、物体の本来の位置と一致するように調整されているため、
                // 反映の際には修正した値を設定する。
                me.x = bodyPos.x * worldScale - me.width / 2;
                me.y = bodyPos.y * worldScale - me.height / 2;
            }
        }
    }

    // Bodyの設定をまとめたもの
    export interface BodyDefinition {
        fixtureDef: B2FixtureDef;
        bodyDef : B2BodyDef;
    }

    // Bodyと描画する実体を接続するためのインターフェース。
    // このインターフェースを実装したクラスは、BodyBinderを利用して
    // BodyControllerで管理することができる。
    export interface BodyBindable {
        // Bodyと接続する物体の位置
        x:number;
        y:number;
        // 物体のサイズ(full size)
        width:number;
        height:number;
        body:B2Body;

        // reflectBodyState実行時に実行される処理。
        // trueが返された場合には、本来のreflectBodyStateの処理も行われる。
        onreflect() : bool;
    }
}

export module Firework {

    export interface ObjectBase {
        // オブジェクトが有効であるかを返す。
        // isValidがfalseを返す場合、このオブジェクトはそのフレームで取り除かれる。
        isValid() : bool;
    }

    enum ObjectType {
        Wall,
        Star
    }

    enum ObjectState {
        Connected,
        Free,
        PrepareLaunch,
        Launch
    }

    // B2BodyのuserDataに登録する情報
    class ObjectInfo {
        objectState : ObjectState;
        constructor(public type:ObjectType) {this.objectState = ObjectState.Free;}
    }

    export interface IStar extends animation.Entity, Physics.BodyBindable, ObjectBase {
        setColor(color:Base.Color):void;
    }

    // メインのオブジェクトとなるStar
    export class Star extends animation.Shapes.Circle implements IStar {
        body:B2Body;

        // 各starで共通するFixtureDefinition
        static private _fixDef = () : B2FixtureDef => {
            var fix = new Box2D.Dynamics.b2FixtureDef();
            fix.density = 1.0;       // 密度
            fix.friction = 1.5;      // 摩擦係数
            fix.restitution = 0.2;   // 反発係数
            return fix;
        } ();

        private _color: Base.Color = new Base.Color();

        constructor(radius:number) {
            super(radius);
        }

        isValid() : bool {
            return true;
        }

        setColor(color: Base.Color): void {
            this._color = color;
        }

        onreflect() : bool {
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
                    var info : ObjectInfo = e.GetUserData();
                    info.objectState = ObjectState.Connected;
                    if (body != e && info.type == ObjectType.Star) {
                        e.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                    }
                });
                body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                var info : ObjectInfo = body.GetUserData();
                info.objectState = ObjectState.Connected;
            }
            return true;
        }

        render(context: animation.Context): void {
            var r = this.radius;
            var grad = new animation.Gradietion.Radial(context);
            grad.from(this.x + r * 0.7, this.y + r * 0.5, 1).to(this.x + r, this.y + r, r);
            var info : ObjectInfo = this.body.GetUserData();
            if (info.objectState != ObjectState.Connected) {
                grad.colorStop(0.0, "#fff").colorStop(0.5, this._color.toFillStyle()).
                    colorStop(1.0, "#000");
            } else {
                grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").colorStop(1.0, "#000");
            }
            this.gradient = grad;
            super.render(context);
        }

        // 渡されたstarに適合するbodyの設定を作成する。
        public static createFixture(target:IStar, scale:number) : Physics.BodyDefinition {
            var fixDef = this._fixDef;
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.userData = new ObjectInfo(ObjectType.Star);
            bodyDef.position.Set((target.x + target.width / 2) / scale,
                                 (target.y + target.height / 2) / scale);
            bodyDef.angularVelocity = (Math.random() * 2 % 2 ? -1 : 1) * 10;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(target.width / 2 / scale);
            return {bodyDef: bodyDef, fixtureDef :fixDef};
        }
    }

    export interface IStarCase extends animation.Entity, Physics.BodyBindable {}

    export class StarCaseOption {
        // 左右両壁の幅
        sideWallThickness: number = 10;

        // 地面の厚み
        groundThickness: number = 10;
    }

    // width / heightにあてはまるオブジェクトを生成する。
    export class StarCase {
        // 左側の境界位置
        leftBound:number;
        // 右側の境界位置
        rightBound:number;
        // 地面の境界位置
        groundBound:number;

        walls : animation.Entity[] = [];
        wallShapes : Physics.BodyDefinition[] = [];

        constructor(public width:number, public height: number) {}

        initialize(scale:number, option?=new StarCaseOption) : void {
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
        private createWall(x:number, y:number, w:number, h:number) : animation.Entity {
            var p = new animation.Shapes.Box(w, h);
            p.x = x;
            p.y = y;
            return p;
        }

        // 壁に相当する剛体を作る。
        private createShape(scale:number, x:number, y:number, w:number, h:number) : Physics.BodyDefinition {
            var b2BodyDef = Box2D.Dynamics.b2BodyDef
            ,b2Body = Box2D.Dynamics.b2Body
            ,b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            ,b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

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
            return {bodyDef : bodyDef, fixtureDef:fixDef};
        }

    }

}

// canvas element only.
export module Base {

    export class Color {
        constructor(public r=0, public g=0, public b=0, public a=1.0) {}

        toFillStyle() : string {
            var colors = [this.r.toString(), this.g.toString(), this.b.toString(), this.a.toString()].join(',');
            return "rgba(" + colors + ")";
        }
    }
}
