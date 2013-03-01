
import util = module("util");
import animation = module("animation");
import gl = module("gameLib");
import I = util.Illiegals

export interface ObjectBase {
    // �I�u�W�F�N�g���L���ł��邩��Ԃ��B
    // isValid��false��Ԃ��ꍇ�A���̃I�u�W�F�N�g�͂��̃t���[���Ŏ�菜�����B
    isValid(): bool;
}

// �I�u�W�F�N�g�̎�ʂ�\��
enum ObjectType {
    Wall,
    Star
}

// �I�u�W�F�N�g�̏�Ԃ�\��
enum ObjectState {
    Free,
    Connected,
    Touched,
    PrepareLaunch,
    Launch
}

// B2Body��userData�ɓo�^������
class ObjectInfo {
    objectState: ObjectState;
    constructor(public type: ObjectType) { this.objectState = ObjectState.Free; }
}

// Star�ŗ��p����Ă���e����
module StarUtil {

    enum StarSize {
        Large,
        Medium,
        Small,
        VerySmall
    }

    // StarSize���烉���_���ł����ꂩ���擾����
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

export interface IStar extends gl.Entity, gl.Physics.BodyBindable, ObjectBase { }

export module GameObj {

    // Star�ɌW�郍�W�b�N���ӂ̏�����S������B
    // StarLogic���̂�Star�ɃR���|�W�V��������Ă��邪�A
    // StarLogic�ɂ�Star���n����Ă���B
    class StarLogic {


        // �estar�ŋ��ʂ���FixtureDefinition
        private _fixDef = (): B2FixtureDef => {
            var fix = new Box2D.Dynamics.b2FixtureDef();
            fix.density = 1.0;       // ���x
            fix.friction = 1.5;      // ���C�W��
            fix.restitution = 0.2;   // �����W��
            return fix;
        } ();

        state: ObjectInfo = new ObjectInfo(ObjectType.Star);
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
            // �����m��4�ȏ�אڂ�����Astatic�ɕύX����B
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
            return this.state.objectState === ObjectState.Free;
        }

        // �^�b�`���J�n�����ۂ̏����B
        ontouchstart(scene: gl.Scene, e:Event) : bool {
            var s = this.starShape;
            if (this.state.objectState !== ObjectState.PrepareLaunch) {
                s.x -= s.width;
                s.y -= s.height;
                this.data.radius *= 2;
                s.width *= 2;
                s.height *= 2;
                this.data.color.a = 0.3;
                this.state.objectState = ObjectState.PrepareLaunch;
            }
            return true;
        }

        // �^�b�`���ė����ꂽ�Ƃ��A���̎��_�ł̗̈�ɂ������Ă��鐯��
        // �����āA���g���g�傷��B
        ontouchend(scene: gl.Scene, e:Event) : bool {
            if (this.state.objectState === ObjectState.PrepareLaunch) {
                return false;
            }
            var s = this.starShape;
            var contain = scene.entities.filter((elem) => {
                if (elem === s) return false;
                var distance = this.data.radius * 2;
                return this.starShape.within(elem, distance);
            });

            contain.forEach((elem) => {
                scene.removeEntity(elem);
            });

            // ���̂̏����X�V����B
            s.body.SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
            s.body.DestroyFixture(s.body.GetFixtureList());
            var fixDef = this._fixDef;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.data.radius / this.scale);
            s.body.CreateFixture(fixDef);

            s.x -= this.data.radius;
            s.y -= this.data.radius;
            this.data.radius *= 2;
            s.width *= 2;
            s.height *= 2;

           

            // �����i�K�͏I���Ƃ���
            this.state.objectState = ObjectState.PrepareLaunch;
            return true;
        }


        // �n���ꂽstar�ɓK������body�̐ݒ���쐬����B
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

    // ���C���̃I�u�W�F�N�g�ƂȂ�Star
    export class Star extends gl.BaseClasses.EntityImpl implements IStar {

        private _logic: StarLogic;
        private _renderer: animation.Renderer.Circle.CircleRenderer;

        body: B2Body;
        private data: animation.Renderer.Circle.Data;

        set color(col:animation.Common.Color) { this.data.color = col;}

        constructor() {
            super();
            this.data = new animation.Renderer.Circle.Data(0, 0, StarUtil.getSomeSize());
            this._renderer = new animation.Renderer.Circle.CircleRenderer(this.data);

            this._logic = new StarLogic(this, this.data);

            // �o�C���h���Ă���
            I.propBind([I.binder("x"), I.binder("y"), I.binder("zIndex"),
                I.binder("width"), I.binder("height"),
                I.binder("visible"), I.binder("radius")], this, this.data);
        }

        isValid(): bool {
            return true;
        }

        isConnectable() : bool {return this._logic.isConnectable();}

        // body����f�[�^�𔽉f������ۂɌĂяo�����R�[���o�b�N
        onreflect(): bool { return this._logic.onreflect();}

        // star�������_�����O����B�����_�����O�������̂́Acircle��render�ɔC����B
        render(context: animation.Context): void {
            

            var r = this.data.radius;
            var grad = new animation.Gradietion.Radial(context);
            grad.from(this.x + r * 0.7, this.y + r * 0.5, 1).to(this.x + r, this.y + r, r);
            var info: ObjectInfo = this.body.GetUserData();

            // �A�����Ă���ꍇ�́A�D�F�x�[�X�̐F�ɂ��Ă��܂�
            switch (this._logic.state.objectState) {
            case ObjectState.Connected:
                grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").colorStop(1.0, "#000");
                break;
            case ObjectState.PrepareLaunch:
                grad.colorStop(0.0, this.data.color.toFillStyle()).colorStop(1.0, this.data.color.toFillStyle());
                break;
            default:
                grad.colorStop(0.0, "#fff").colorStop(0.5, this.data.color.toFillStyle()).
                    colorStop(1.0, "#000");
            }
            this.data.gradient = grad;
            this._renderer.render(context);
        }

        createFixture(scale: number): gl.Physics.BodyDefinition {
            return this._logic.createFixture(scale);
        }

        // ontouchstart�̃n���h�����쐬���ĕԂ��B
        makeTouchStartHandler(scene: gl.Scene) : (e:Event) => bool {
            return (e:Event) => {
                return this._logic.ontouchstart(scene, e);
            }
        }

        // ontouchend�̃n���h�����쐬���ĕԂ�
        makeTouchEndHandler(scene: gl.Scene): (e: Event) => bool {
            return (e: Event) => {
                return this._logic.ontouchend(scene, e);
            }
        }
    }

    export interface IStarCase extends gl.Entity, gl.Physics.BodyBindable {}

    export class StarCaseOption {
        // ���E���ǂ̕�
        sideWallThickness: number = 10;

        // �n�ʂ̌���
        groundThickness: number = 10;
    }

    class Wall extends gl.BaseClasses.EntityImpl {

        private data : animation.Renderer.Box.Data;
        private _renderer: animation.Renderable;

        constructor(width: number, height: number) {
            super();
            this.data = new animation.Renderer.Box.Data(0, 0, width, height);
            this._renderer = new animation.Renderer.Box.BoxRenderer(this.data);

            // �o�C���h���Ă���
            I.propBind([I.binder("x"), I.binder("y"), I.binder("zIndex"),
                I.binder("width"), I.binder("height"),
                I.binder("visible"), I.binder("radius")], this, this.data);
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
            this.walls.push(this.createWall(0, 0, sideThick, this.height));
            this.walls.push(this.createWall(this.width - sideThick, 0, sideThick, this.height));
            this.walls.push(this.createWall(0, this.height - ground, this.width, ground));

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
        private createWall(x: number, y: number, w: number, h: number): gl.Entity {
            var p = new Wall(w, h);
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

}