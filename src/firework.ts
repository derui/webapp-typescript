import util = module("util");
import animation = module("animation");
import gl = module("gameLib");
import I = util.Illiegals
import star = module("star");

export interface ObjectBase {
    // �I�u�W�F�N�g���L���ł��邩��Ԃ��B
    // isValid��false��Ԃ��ꍇ�A���̃I�u�W�F�N�g�͂��̃t���[���Ŏ�菜�����B
    isValid(): bool;
}

// �I�u�W�F�N�g�̎�ʂ�\��
export enum ObjectType {
    Wall,
    Star
}

// �I�u�W�F�N�g�̏�Ԃ�\��
export enum ObjectState {
    Free,
    Connected,
    Touched,
    PrepareLaunch,
    Launch
}

// B2Body��userData�ɓo�^������
export class ObjectInfo {
    objectState: ObjectState;
    constructor(public type: ObjectType) { this.objectState = ObjectState.Free; }
}

export module Scenes {
    export class GameOver extends gl.SceneImpl {
        x:number = 0;
        y:number = 0;
        
        constructor(game: gl.Game) {
            super();
            this.x = game.width / 2;
            this.y = game.height / 2 - 16;
            this.on(gl.EventConstants.ENTER_FRAME, this.tickFrame);
        }

        tickFrame(e:Event) : void {
        }

        render(context:animation.Context) : void {
            var c = context.context;
            c.font = "32px Arial";
            c.fillStyle = new animation.Common.Color(200, 200, 200).toFillStyle();
            c.textAlign = "center";
            c.fillText("Game Over!", this.x, this.y);
        }
    }
}


export module GameObj {

    export var Star = star.Star;

    export interface IStar extends gl.Entity, gl.Physics.BodyBindable, ObjectBase {}
    export interface IStarCase extends gl.Entity, gl.Physics.BodyBindable {}

    export class StarCaseOption {
        // ���E���ǂ̕�
        sideWallThickness: number = 10;

        // �n�ʂ̌���
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

            // �o�C���h���Ă���
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


    // width / height�ɂ��Ă͂܂�I�u�W�F�N�g�𐶐�����B
    export class StarCase {
        // �����̋��E�ʒu
        leftBound: number;
        // �E���̋��E�ʒu
        rightBound: number;
        // �n�ʂ̋��E�ʒu
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

            // �����ō쐬����鍄�̂́A�����߂�Sprite�̔{�ɑ������鍄�̂Ƃ���
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

        // �ǂɑ�������sprite�����
        private createWall(x: number, y: number, w: number, h: number, wallType : WallType): gl.Entity {
            var p = new Wall(w, h, wallType);
            p.x = x;
            p.y = y;
            return p;
        }

        // �ǂɑ������鍄�̂����B
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

    // �I���n�_��\���B���ꎩ�̂́A�\���͂���邾����Entity�ł����Ȃ��B
    export class DeadLine extends gl.BaseClasses.EntityImpl {

        private _data: animation.Renderer.Box.Data;
        private _renderer: animation.Renderer.Box.BoxRenderer;
        hasOverStar : bool = false;

        constructor(public width : number, public endline : number) {
            super();
            this._data = new animation.Renderer.Box.Data(0, endline, width, 1);
            this._renderer = new animation.Renderer.Box.BoxRenderer(this._data);
            this._data.color = new animation.Common.Color(255, 0, 0, 0.7);
            this.enableCorrect = false;

            var option = new StarCaseOption;
            this._data.x = option.sideWallThickness;
            this._data.width = width - (option.sideWallThickness * 2);
            this.listener.on(gl.EventConstants.ENTER_FRAME, this.onenterframe);
        }

        onenterframe(event: MouseEvent) : void {
            var entities = this.scene.entities;
            // ���g������ɑ��݂�����̂����݂��邩�ǂ������擾����
            entities = entities.filter((elem) => {
                return elem.y + elem.height > this._data.y;
            });

            this.hasOverStar = entities.length > 0;
        }

        render(context:animation.Context) : void {
            this._renderer.render(context);
        }
    }
}