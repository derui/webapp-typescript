import util = module("util");
import animation = module("animation");
import gl = module("gameLib");
import I = util.Illiegals
import star = module("star");

export interface ObjectBase {
    // オブジェクトが有効であるかを返す。
    // isValidがfalseを返す場合、このオブジェクトはそのフレームで取り除かれる。
    isValid(): bool;
}

// オブジェクトの種別を表す
export enum ObjectType {
    Wall,
    Star
}

// オブジェクトの状態を表す
export enum ObjectState {
    Free,
    Connected,
    Touched,
    PrepareLaunch,
    Launch
}

// B2BodyのuserDataに登録する情報
export class ObjectInfo {
    objectState: ObjectState;
    constructor(public type: ObjectType) { this.objectState = ObjectState.Free; }
}


export module GameObj {

    export var Star = star.Star;

    export interface IStar extends gl.Entity, gl.Physics.BodyBindable, ObjectBase {}
    export interface IStarCase extends gl.Entity, gl.Physics.BodyBindable {}

    export class StarCaseOption {
        // 左右両壁の幅
        sideWallThickness: number = 10;

        // 地面の厚み
        groundThickness: number = 10;
    }

    enum WallType {
        Left, Right, Bottom
    }

    class Wall extends gl.BaseClasses.EntityImpl {

        private _data: animation.Renderer.Box.Data;
        private _renderer: animation.Renderer.Box.BoxRenderer;
        private _wallType : WallType;

        constructor(width: number, height: number, wallType : WallType) {
            super();
            this._data = new animation.Renderer.Box.Data(0, 0, width, height);
            this._data.color.r = 0;
            this._data.color.g = 0;
            this._data.color.b = 0;

            this._renderer = new animation.Renderer.Box.BoxRenderer(this._data);
            this._wallType = wallType;

            // バインドしておく
            I.propBind([I.binder("x"), I.binder("y"), I.binder("zIndex"),
                        I.binder("width"), I.binder("height"),
                        I.binder("visible")], this, this._data);
        }

        render(context:animation.Context) : void {
            var white = new animation.Common.Color(255, 255, 255);
            var grad = new animation.Gradation.Linear(context);
            switch (this._wallType) {
            case WallType.Left:
                grad.from(this.x, this.y + this.height / 2).to(this.x + this.width, this.y + this.height / 2);
                grad.colorStop(0.0, this._data.color.toFillStyle())
                    .colorStop(0.9, white.toFillStyle())
                    .colorStop(1.0, this._data.color.toFillStyle());
                this._data.gradient = grad;
                break;
            case WallType.Right:
                grad.from(this.x, this.y + this.height / 2).to(this.x + this.width, this.y + this.height / 2);
                grad.colorStop(0.0, white.toFillStyle())
                    .colorStop(1.0, this._data.color.toFillStyle());
                this._data.gradient = grad;
                break;
            case WallType.Bottom:
                grad.from(this.x, this.y).to(this.x + this.width, this.y);
                grad.colorStop(0.0, this._data.color.toFillStyle())
                    .colorStop(0.5, white.toFillStyle())
                    .colorStop(1.0, this._data.color.toFillStyle());
                this._data.gradient = grad;
                break;
            }
                
            this._renderer.render(context);
        }
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
            this.walls.push(this.createWall(0, 0, sideThick, this.height, WallType.Left));
            this.walls.push(this.createWall(this.width - sideThick, 0, sideThick, this.height, WallType.Right));
            this.walls.push(this.createWall(0, this.height - ground, this.width, ground, WallType.Bottom));

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
        private createWall(x: number, y: number, w: number, h: number, wallType : WallType): gl.Entity {
            var p = new Wall(w, h, wallType);
            p.x = x;
            p.y = y;
            return p;
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