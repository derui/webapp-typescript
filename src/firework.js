var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "util", "animation", "gameLib", "star"], function(require, exports, __util__, __animation__, __gl__, __star__) {
    var util = __util__;

    var animation = __animation__;

    var gl = __gl__;

    var I = util.Illiegals;
    var star = __star__;

    // �I�u�W�F�N�g�̎��ʂ��\��
    (function (ObjectType) {
        ObjectType._map = [];
        ObjectType._map[0] = "Wall";
        ObjectType.Wall = 0;
        ObjectType._map[1] = "Star";
        ObjectType.Star = 1;
    })(exports.ObjectType || (exports.ObjectType = {}));
    var ObjectType = exports.ObjectType;
    // �I�u�W�F�N�g�̏��Ԃ��\��
    (function (ObjectState) {
        ObjectState._map = [];
        ObjectState._map[0] = "Free";
        ObjectState.Free = 0;
        ObjectState._map[1] = "Connected";
        ObjectState.Connected = 1;
        ObjectState._map[2] = "Touched";
        ObjectState.Touched = 2;
        ObjectState._map[3] = "PrepareLaunch";
        ObjectState.PrepareLaunch = 3;
        ObjectState._map[4] = "Launch";
        ObjectState.Launch = 4;
    })(exports.ObjectState || (exports.ObjectState = {}));
    var ObjectState = exports.ObjectState;
    // B2Body��userData�ɓo�^��������
    var ObjectInfo = (function () {
        function ObjectInfo(type) {
            this.type = type;
            this.objectState = ObjectState.Free;
        }
        return ObjectInfo;
    })();
    exports.ObjectInfo = ObjectInfo;    
    (function (GameObj) {
        GameObj.Star = star.Star;
        var StarCaseOption = (function () {
            function StarCaseOption() {
                // ���E���ǂ̕�
                this.sideWallThickness = 10;
                // �n�ʂ̌���
                this.groundThickness = 10;
            }
            return StarCaseOption;
        })();
        GameObj.StarCaseOption = StarCaseOption;        
        var Wall = (function (_super) {
            __extends(Wall, _super);
            function Wall(width, height) {
                        _super.call(this);
                this._data = new animation.Renderer.Box.Data(0, 0, width, height);
                this._data.color.r = 255;
                this._data.color.g = 255;
                this._data.color.b = 255;
                this._renderer = new animation.Renderer.Box.BoxRenderer(this._data);
                // �o�C���h���Ă���
                I.propBind([
                    I.binder("x"), 
                    I.binder("y"), 
                    I.binder("zIndex"), 
                    I.binder("width"), 
                    I.binder("height"), 
                    I.binder("visible")
                ], this, this._data);
            }
            Wall.prototype.render = function (context) {
                this._renderer.render(context);
            };
            return Wall;
        })(gl.BaseClasses.EntityImpl);        
        // width / height�ɂ��Ă͂܂��I�u�W�F�N�g�𐶐������B
        var StarCase = (function () {
            function StarCase(width, height) {
                this.width = width;
                this.height = height;
                this.walls = [];
                this.wallShapes = [];
            }
            StarCase.prototype.initialize = function (scale, option) {
                if (typeof option === "undefined") { option = new StarCaseOption(); }
                var sideThick = option.sideWallThickness, ground = option.groundThickness;
                this.walls.push(this.createWall(0, 0, sideThick, this.height));
                this.walls.push(this.createWall(this.width - sideThick, 0, sideThick, this.height));
                this.walls.push(this.createWall(0, this.height - ground, this.width, ground));
                // �����ō쐬�����鍄�̂́A�����߂�Sprite�̔{�ɑ������鍄�̂Ƃ���
                this.wallShapes.push(this.createShape(scale, -sideThick, 0, sideThick * 2, this.height * 2));
                this.wallShapes.push(this.createShape(scale, this.width - sideThick, 0, sideThick * 2, this.height * 2));
                this.wallShapes.push(this.createShape(scale, 0, this.height - ground, this.width * 2, ground * 2));
                this.leftBound = sideThick;
                this.rightBound = this.width - sideThick;
                this.groundBound = this.height - ground;
            };
            StarCase.prototype.createWall = // �ǂɑ�������sprite������
            function (x, y, w, h) {
                var p = new Wall(w, h);
                p.x = x;
                p.y = y;
                return p;
            };
            StarCase.prototype.createShape = // �ǂɑ������鍄�̂������B
            function (scale, x, y, w, h) {
                var b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
                var fixDef = new b2FixtureDef();
                fixDef.density = 1.0;
                fixDef.friction = 1.5;
                fixDef.restitution = 0.2;
                var bodyDef = new b2BodyDef();
                bodyDef.type = b2Body.b2_staticBody;
                bodyDef.position.Set((x + w / 2) / scale, (y + h / 2) / scale);
                bodyDef.userData = new ObjectInfo(ObjectType.Wall);
                fixDef.shape = new b2PolygonShape();
                fixDef.shape.SetAsBox(w / scale / 2, h / scale / 2);
                return {
                    bodyDef: bodyDef,
                    fixtureDef: fixDef
                };
            };
            return StarCase;
        })();
        GameObj.StarCase = StarCase;        
    })(exports.GameObj || (exports.GameObj = {}));
    var GameObj = exports.GameObj;
})
