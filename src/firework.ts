
import util = module("util");
import animation = module("animation");
import gl = module("gameLib");

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
    Connected,
    Free,
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

export interface IStar extends gl.Entity, gl.Physics.BodyBindable, ObjectBase {
    setColor(color: animation.Common.Color): void;
}

// ���C���̃I�u�W�F�N�g�ƂȂ�Star
export class Star extends gl.BaseClasses.EntityImpl implements IStar {
    body: B2Body;
    private _circle: animation.Shapes.Circle;

    // �estar�ŋ��ʂ���FixtureDefinition
    static private _fixDef = (): B2FixtureDef => {
        var fix = new Box2D.Dynamics.b2FixtureDef();
        fix.density = 1.0;       // ���x
        fix.friction = 1.5;      // ���C�W��
        fix.restitution = 0.2;   // �����W��
        return fix;
    } ();

    private _color: animation.Common.Color = new animation.Common.Color();

    // �K�v�ȃp�����[�^�𓯊�������
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

    // body����f�[�^�𔽉f������ۂɌĂяo�����R�[���o�b�N
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
        // �����m��4�ȏ�אڂ�����Astatic�ɕύX����B
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

    // star�������_�����O����B�����_�����O�������̂́Acircle��render�ɔC����B
    render(context: animation.Context): void {
        var r = this._circle.radius;
        var grad = new animation.Gradietion.Radial(context);
        grad.from(this.x + r * 0.7, this.y + r * 0.5, 1).to(this.x + r, this.y + r, r);
        var info: ObjectInfo = this.body.GetUserData();

        // �A�����Ă���ꍇ�́A�D�F�x�[�X�̐F�ɂ��Ă��܂�
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

    // �n���ꂽstar�ɓK������body�̐ݒ���쐬����B
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
    // ���E���ǂ̕�
    sideWallThickness: number = 10;

    // �n�ʂ̌���
    groundThickness: number = 10;
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
        var p = new animation.Shapes.Box(w, h);
        p.x = x;
        p.y = y;
        return new gl.BaseClasses.EntityProxy(p);
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