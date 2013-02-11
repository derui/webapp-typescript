/// <reference path='../lib/Box2dWeb.d.ts' />
/// <reference path='../lib/enchant.d.ts' />

import util = module("util");

enchant();

export module Physics {
    export class World {
        private _world: B2World;
        private _worldScale: number = 100;
        private _adapters: BodyAdapter[] = [];
        get worldScale() :number {return this._worldScale;}

        constructor(gravity:B2Vec2, sleep=true) {
            this._world = new Box2D.Dynamics.b2World(gravity, sleep);
        }

        // 渡されたBodyCombinableと、BodyDefinitionから、BodyAdapterを作成し、
        // 内部に登録する。
        add(def: BodyDefinition, target:BodyCombinable) : BodyAdapter {
            var body = this._world.CreateBody(def.bodyDef);
            body.CreateFixture(def.fixtureDef);
            var adapter = new BodyAdapter(target, body);
            this._adapters.push(adapter);
            return adapter;
        }

        // 指定したBodyDefに基づいたBodyを追加し、追加したBodyを返す。
        addBody(def: BodyDefinition) : B2Body {
            var body = this._world.CreateBody(def.bodyDef);
            body.CreateFixture(def.fixtureDef);
            return body;
        }

        // 指定したtargetを持つadapterを削除する。
        remove(target:BodyAdapter) : void {
            this._adapters = this._adapters.filter((value, index, array) => {
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
            this._adapters.forEach((value, index, ary) => {
                ary[index].reflectBodyState(this._worldScale);
            });
        }
    }

    // Bodyと、BodyCombinable間のadapterとして働く。
    // Worldによって更新されたBodyの状態を、BodyCombinableに反映する。
    export class BodyAdapter {
        private _target : BodyCombinable;
        private _body  : B2Body;
        get target() : BodyCombinable {return this._target;}
        get body(): B2Body {return this._body;}

        constructor(target:BodyCombinable, body: B2Body) {
            this._target = target;
            this._body = body;
        }

        // Bodyの現在の位置をtargetに反映する。
        // worldScaleは、Bodyの位置・サイズを1として、pixelに変換する際の係数。
        // 1 meter / 100 pixelならば、100とする。
        reflectBodyState(worldScale: number) : void {
            var bodyPos = this._body.GetPosition()
            ,me = this._target;

            me.x = bodyPos.x * worldScale;
            me.y = bodyPos.y * worldScale;
        }
    }

    // Bodyの設定をまとめたもの
    export interface BodyDefinition {
        fixtureDef: B2FixtureDef;
        bodyDef : B2BodyDef;
    }

    // Bodyと描画する実体を接続するためのインターフェース。
    // このインターフェースを実装したクラスは、BodyAdapterを利用して
    // BodyControllerで管理することができる。
    export interface BodyCombinable {
        // Bodyと接続する物体の位置
        x:number;
        y:number;
    }
}

export module Firework {

    export interface IStar extends EnchantSprite, Physics.BodyCombinable {
        setColor(color:Base.Color):void;
    }

    // Starを生成するためのファクトリ
    export class Star {
        // enchant.jsから生成したクラスオブジェクトを保存する
        private static _singleton : IStar = null;

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
                    surf.context.beginPath();
                    surf.context.arc(width / 2, width / 2, width / 2, 0, Math.PI*2, true);
                    surf.context.fill();
                    this.image = surf;
                    this.x = 0;
                    this.y = 0;
                    this.frame = 1;
                    this.scaleX = 1.0;
                    this.scaleY = 1.0
                    this.setColor = (color:Base.Color) :void => {
                        var surf = new Surface(width, height);
                        surf.context.beginPath();
                        surf.context.fillStyle = color.toFillStyle();
                        surf.context.arc(width / 2, width / 2, width / 2, 0, Math.PI*2, true);
                        surf.context.fill();
                        this.image = surf;
                        this.color = color;
                    };
                }
            });
            this._singleton = <IStar>p;
            return new this._singleton(width, height);
        }

        static getStarImageName(num : number) :string {
            var num = util.String.zeroPadding(num, 2);
            return "image/glassbtn" + num + ".png";
        }
    }

    export interface IStarCase extends EnchantSprite, Physics.BodyCombinable {

    }

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

            this.wallShapes.push(this.createShape(scale, sideThick * 1.5, 0, sideThick / 2,
                                                  this.height));
            this.wallShapes.push(this.createShape(scale, this.width - sideThick * 1.5, 0, sideThick / 2,
                                                  this.height));
            this.wallShapes.push(this.createShape(scale,0, this.height - ground * 1.5, this.width, ground / 2));
        }

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
            bodyDef.position.Set(x, y);
            fixDef.shape = new b2PolygonShape();
            fixDef.shape.SetAsBox(w, h);
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
