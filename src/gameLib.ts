/// <reference path='../lib/Box2dWeb.d.ts' />
/// <reference path='../lib/enchant.d.ts' />

import util = module("util");

enchant();

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
                this._binded = true;
            }
        }

        // Bodyの現在の位置をtargetに反映する。
        // worldScaleは、Bodyの位置・サイズを1として、pixelに変換する際の係数。
        // 1 meter / 100 pixelならば、100とする。
        reflectBodyState(worldScale: number) : void {
            var bodyPos = this._body.GetPosition()
            ,me = this._target;

            // 剛体の座標は、物体の本来の位置と一致するように調整されているため、
            // 反映の際には修正した値を設定する。
            me.x = bodyPos.x * worldScale - me.width / 2;
            me.y = bodyPos.y * worldScale - me.height / 2;
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
    }
}

export module Firework {

    export interface IStar extends EnchantSprite, Physics.BodyBindable {
        setColor(color:Base.Color):void;
    }

    // Starを生成するためのファクトリ
    export class Star {
        // enchant.jsから生成したクラスオブジェクトを保存する
        private static _singleton : IStar = null;

        // 各starで共通するFixtureDefinition
        private static _fixDef = () : B2FixtureDef => {
            var fix = new Box2D.Dynamics.b2FixtureDef();
            fix.density = 1.0;       // 密度
            fix.friction = 1.5;      // 摩擦係数
            fix.restitution = 0.2;   // 反発係数
            return fix;
        }();

        // enchant.jsのenchant.Class.createでの拡張は、TypeScriptのやりかたではサポート
        // できないため、一部本来のJavaScriptとして扱う必要がある。
        static create(width:number,height:number) : IStar {
            if (_singleton != null) {
                return new this._singleton(width, height);
            }
            var p : any = enchant.Class.create(Sprite, {
                initialize : function () {
                    Sprite.call(this, width, height);
                    var surf = new Surface(width, height);
                    this.image = surf;
                    this.x = 0;
                    this.y = 0;
                    this.frame = 1;
                    this.scaleX = 1.0;
                    this.scaleY = 1.0
                    this.setColor = (color:Base.Color) :void => {
                        var surf = new Surface(width, height);
                        var r = width / 2;
                        var grad = surf.context.createRadialGradient(
                            r * 0.7, r * 0.5, 1,
                            r, r, r);
                        grad.addColorStop(0.0, "#fff");
                        grad.addColorStop(0.50, color.toFillStyle());
                        grad.addColorStop(1.0, "#000");
                        surf.context.fillStyle = grad;
                        surf.context.beginPath();
                        surf.context.arc(width / 2, width / 2, width / 2, 0, Math.PI*2, false);
                        surf.context.fill();
                        this.image = surf;
                        this.color = color;
                    };
                }
            });
            this._singleton = <IStar>p;
            return new this._singleton(width, height);
        }

        // 渡されたstarに適合するbodyの設定を作成する。
        private static createFixture(target:IStar, scale:number) : Physics.BodyDefinition {
            var fixDef = this._fixDef;
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.position.Set((target.x + target.width / 2) / scale,
                                 (target.y + target.height / 2) / scale);
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(target.width / 2 / scale);
            return {bodyDef: bodyDef, fixtureDef :fixDef};
        }
    }

    export interface IStarCase extends EnchantSprite, Physics.BodyBindable {}

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

        walls : EnchantSprite[] = [];
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
        private createWall(x:number, y:number, w:number, h:number) : EnchantSprite {
            var p = new Sprite(w, h);
            var surf = new Surface(w, h);
            surf.context.beginPath();
            surf.context.fillRect(0, 0, w, h);
            surf.context.fill();
            p.image = surf;
            p.x = x;
            p.y = y;
            p.frame = 1;
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
