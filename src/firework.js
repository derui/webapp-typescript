var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "animation", "gameLib"], function(require, exports, __animation__, __gl__) {
    
    var animation = __animation__;

    var gl = __gl__;

    // ƒIƒuƒWƒFƒNƒg‚ÌŽí•Ê‚ð•\‚·
    var ObjectType;
    (function (ObjectType) {
        ObjectType._map = [];
        ObjectType._map[0] = "Wall";
        ObjectType.Wall = 0;
        ObjectType._map[1] = "Star";
        ObjectType.Star = 1;
    })(ObjectType || (ObjectType = {}));
    // ƒIƒuƒWƒFƒNƒg‚Ìó‘Ô‚ð•\‚·
    var ObjectState;
    (function (ObjectState) {
        ObjectState._map = [];
        ObjectState._map[0] = "Connected";
        ObjectState.Connected = 0;
        ObjectState._map[1] = "Free";
        ObjectState.Free = 1;
        ObjectState._map[2] = "PrepareLaunch";
        ObjectState.PrepareLaunch = 2;
        ObjectState._map[3] = "Touched";
        ObjectState.Touched = 3;
        ObjectState._map[4] = "Launch";
        ObjectState.Launch = 4;
    })(ObjectState || (ObjectState = {}));
    // B2Body‚ÌuserData‚É“o˜^‚·‚éî•ñ
    var ObjectInfo = (function () {
        function ObjectInfo(type) {
            this.type = type;
            this.objectState = ObjectState.Free;
        }
        return ObjectInfo;
    })();    
    // Star‚Å—˜—p‚³‚ê‚Ä‚¢‚éŠeŽíî•ñ
    var StarUtil;
    (function (StarUtil) {
        var StarSize;
        (function (StarSize) {
            StarSize._map = [];
            StarSize._map[0] = "Large";
            StarSize.Large = 0;
            StarSize._map[1] = "Medium";
            StarSize.Medium = 1;
            StarSize._map[2] = "Small";
            StarSize.Small = 2;
            StarSize._map[3] = "VerySmall";
            StarSize.VerySmall = 3;
        })(StarSize || (StarSize = {}));
        // StarSize‚©‚çƒ‰ƒ“ƒ_ƒ€‚Å‚¢‚¸‚ê‚©‚ðŽæ“¾‚·‚é
        function getSomeType() {
            switch(Math.floor(Math.random() * 4)) {
                case 0:
                    return StarSize.Large;
                case 1:
                    return StarSize.Medium;
                case 2:
                    return StarSize.Small;
                case 3:
                    return StarSize.VerySmall;
            }
        }
        function getSomeSize() {
            switch(getSomeType()) {
                case StarSize.Large:
                    return 16;
                case StarSize.Medium:
                    return 14;
                case StarSize.Small:
                    return 12;
                case StarSize.VerySmall:
                    return 10;
            }
        }
        StarUtil.getSomeSize = getSomeSize;
    })(StarUtil || (StarUtil = {}));
    // ƒƒCƒ“‚ÌƒIƒuƒWƒFƒNƒg‚Æ‚È‚éStar
    var Star = (function (_super) {
        __extends(Star, _super);
        function Star() {
                _super.call(this);
            this._state = new ObjectInfo(ObjectType.Star);
            this._scale = 1;
            // Šestar‚Å‹¤’Ê‚·‚éFixtureDefinition
            this._fixDef = (function () {
                var fix = new Box2D.Dynamics.b2FixtureDef();
                fix.density = 1.0// –§“x
                ;
                fix.friction = 1.5// –€ŽCŒW”
                ;
                fix.restitution = 0.2// ”½”­ŒW”
                ;
                return fix;
            })();
            this._circle = new animation.Shapes.Circle(StarUtil.getSomeSize());
            this.syncParam();
        }
        Object.defineProperty(Star.prototype, "color", {
            set: function (col) {
                this._circle.baseColor = col;
            },
            enumerable: true,
            configurable: true
        });
        Star.prototype.syncParam = // •K—v‚Èƒpƒ‰ƒ[ƒ^‚ð“¯Šú‚³‚¹‚é
        function () {
            this._circle.x = this.x;
            this._circle.y = this.y;
            this.width = this._circle.width;
            this.height = this._circle.height;
            this._circle.zIndex = this.zIndex;
        };
        Star.prototype.isValid = function () {
            return true;
        };
        Star.prototype.isConnectable = function () {
            return this._state.objectState === ObjectState.Free;
        };
        Star.prototype.onreflect = // body‚©‚çƒf[ƒ^‚ð”½‰f‚³‚¹‚éÛ‚ÉŒÄ‚Ño‚³‚ê‚éƒR[ƒ‹ƒoƒbƒN
        function () {
            var body = this.body;
            var count = 0;
            var contacts = [];
            for(var n = body.GetContactList(); n != null; n = n.next) {
                if(n.contact.IsTouching()) {
                    contacts.push(n.other);
                }
            }
            // ¯“¯Žm‚ª4‚ÂˆÈã—×Ú‚µ‚½‚çAstatic‚É•ÏX‚·‚éB
            if(contacts.length >= 4 && this.isConnectable()) {
                contacts.filter(function (e) {
                    var info_e = e.GetUserData();
                    return info_e.objectState == ObjectState.Free;
                }).forEach(function (e) {
                    var info_e = e.GetUserData();
                    info_e.objectState = ObjectState.Connected;
                    if(body != e && info_e.type == ObjectType.Star) {
                        e.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                    }
                });
                body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                var info = body.GetUserData();
                info.objectState = ObjectState.Connected;
            }
            return true;
        };
        Star.prototype.render = // star‚ðƒŒƒ“ƒ_ƒŠƒ“ƒO‚·‚éBƒŒƒ“ƒ_ƒŠƒ“ƒOˆ—Ž©‘Ì‚ÍAcircle‚Ìrender‚É”C‚¹‚éB
        function (context) {
            var r = this._circle.radius;
            var grad = new animation.Gradietion.Radial(context);
            grad.from(this.x + r * 0.7, this.y + r * 0.5, 1).to(this.x + r, this.y + r, r);
            var info = this.body.GetUserData();
            // ˜AŒ‹‚µ‚Ä‚¢‚éê‡‚ÍAŠDFƒx[ƒX‚ÌF‚É‚µ‚Ä‚µ‚Ü‚¤
            switch(this._state.objectState) {
                case ObjectState.Connected:
                    grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").colorStop(1.0, "#000");
                    break;
                case ObjectState.PrepareLaunch:
                    grad.colorStop(0.0, this._circle.baseColor.toFillStyle()).colorStop(1.0, this._circle.baseColor.toFillStyle());
                    break;
                default:
                    grad.colorStop(0.0, "#fff").colorStop(0.5, this._circle.baseColor.toFillStyle()).colorStop(1.0, "#000");
            }
            this.syncParam();
            this._circle.gradient = grad;
            this._circle.render(context);
        };
        Star.prototype.createFixture = // “n‚³‚ê‚½star‚É“K‡‚·‚ébody‚ÌÝ’è‚ðì¬‚·‚éB
        function (scale) {
            var fixDef = this._fixDef;
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.userData = this._state;
            bodyDef.position.Set((this.x + this.width / 2) / scale, (this.y + this.height / 2) / scale);
            bodyDef.angularVelocity = (Math.random() * 2 % 2 ? -1 : 1) * 10;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.width / 2 / scale);
            this._scale = scale;
            return {
                bodyDef: bodyDef,
                fixtureDef: fixDef
            };
        };
        Star.prototype.makeTouchStartHandler = // ontouchstart‚Ìƒnƒ“ƒhƒ‰‚ðì¬‚µ‚Ä•Ô‚·B
        function (scene) {
            var _this = this;
            return function (e) {
                if(_this._state.objectState !== ObjectState.PrepareLaunch) {
                    _this._circle.x -= _this._circle.width;
                    _this._circle.y -= _this._circle.height;
                    _this._circle.radius *= 2;
                    _this._circle.width *= 2;
                    _this._circle.height *= 2;
                    _this._circle.baseColor.a = 0.3;
                    _this._state.objectState = ObjectState.PrepareLaunch;
                }
                return true;
            };
        };
        Star.prototype.makeTouchEndHandler = // ontouchend‚Ìƒnƒ“ƒhƒ‰‚ðì¬‚µ‚Ä•Ô‚·
        function (scene) {
            var _this = this;
            // ƒ^ƒbƒ`‚µ‚Ä—£‚³‚ê‚½‚Æ‚«A‚»‚ÌŽž“_‚Å‚Ì—Ìˆæ‚É‚©‚©‚Á‚Ä‚¢‚é¯‚ð
            // Á‚µ‚ÄAŽ©g‚ðŠg‘å‚·‚éB
            return function (e) {
                var contain = scene.entities.filter(function (elem) {
                    var distance = _this._circle.radius * 2;
                    return _this.within(elem, distance);
                });
                contain.forEach(function (elem) {
                    scene.removeEntity(elem);
                });
                // „‘Ì‚Ìî•ñ‚ðXV‚·‚éB
                _this._circle.radius *= 2;
                _this.body.SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
                _this.body.DestroyFixture(_this.body.GetFixtureList());
                var fixDef = _this._fixDef;
                fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(_this.width / 2 / _this._scale);
                _this.body.CreateFixture(fixDef);
                // €”õ’iŠK‚ÍI—¹‚Æ‚·‚é
                _this._state.objectState = ObjectState.PrepareLaunch;
                return true;
            };
        };
        return Star;
    })(gl.BaseClasses.EntityImpl);
    exports.Star = Star;    
    var StarCaseOption = (function () {
        function StarCaseOption() {
            // ¶‰E—¼•Ç‚Ì•
            this.sideWallThickness = 10;
            // ’n–Ê‚ÌŒú‚Ý
            this.groundThickness = 10;
        }
        return StarCaseOption;
    })();
    exports.StarCaseOption = StarCaseOption;    
    // width / height‚É‚ ‚Ä‚Í‚Ü‚éƒIƒuƒWƒFƒNƒg‚ð¶¬‚·‚éB
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
            // ‚±‚±‚Åì¬‚³‚ê‚é„‘Ì‚ÍAŒ©‚½‚ß‚ÌSprite‚Ì”{‚É‘Š“–‚·‚é„‘Ì‚Æ‚·‚é
            this.wallShapes.push(this.createShape(scale, -sideThick, 0, sideThick * 2, this.height * 2));
            this.wallShapes.push(this.createShape(scale, this.width - sideThick, 0, sideThick * 2, this.height * 2));
            this.wallShapes.push(this.createShape(scale, 0, this.height - ground, this.width * 2, ground * 2));
            this.leftBound = sideThick;
            this.rightBound = this.width - sideThick;
            this.groundBound = this.height - ground;
        };
        StarCase.prototype.createWall = // •Ç‚É‘Š“–‚·‚ésprite‚ðì‚é
        function (x, y, w, h) {
            var p = new animation.Shapes.Box(w, h);
            p.x = x;
            p.y = y;
            return new gl.BaseClasses.EntityProxy(p);
        };
        StarCase.prototype.createShape = // •Ç‚É‘Š“–‚·‚é„‘Ì‚ðì‚éB
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
    exports.StarCase = StarCase;    
})
//@ sourceMappingURL=firework.js.map
