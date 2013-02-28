var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var animation = require("./animation")
var gl = require("./gameLib")
// オブジェクトの種別を表す
var ObjectType;
(function (ObjectType) {
    ObjectType._map = [];
    ObjectType._map[0] = "Wall";
    ObjectType.Wall = 0;
    ObjectType._map[1] = "Star";
    ObjectType.Star = 1;
})(ObjectType || (ObjectType = {}));
// オブジェクトの状態を表す
var ObjectState;
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
})(ObjectState || (ObjectState = {}));
// B2BodyのuserDataに登録する情報
var ObjectInfo = (function () {
    function ObjectInfo(type) {
        this.type = type;
        this.objectState = ObjectState.Free;
    }
    return ObjectInfo;
})();
// Starで利用されている各種情報
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
    // StarSizeからランダムでいずれかを取得する
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
(function (GameObj) {
    // 各starで共通するFixtureDefinition
    var _fixDef = (function () {
        var fix = new Box2D.Dynamics.b2FixtureDef();
        fix.density = 1.0// 密度
        ;
        fix.friction = 1.5// 摩擦係数
        ;
        fix.restitution = 0.2// 反発係数
        ;
        return fix;
    })();
    // Starに係るロジック周辺の処理を担当する。
    // StarLogic自体はStarにコンポジションされているが、
    // StarLogicにもStarが渡されている。
    var StarLogic = (function () {
        function StarLogic(starShape) {
            this.starShape = starShape;
            this.state = new ObjectInfo(ObjectType.Star);
            this.scale = 1;
        }
        StarLogic.prototype.onreflect = function () {
            var body = this.starShape.body;
            var count = 0;
            var contacts = [];
            for(var n = body.GetContactList(); n != null; n = n.next) {
                if(n.contact.IsTouching()) {
                    contacts.push(n.other);
                }
            }
            // 星同士が4つ以上隣接したら、staticに変更する。
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
                return false;
            }
            return true;
        };
        StarLogic.prototype.isConnectable = function () {
            return this.state.objectState === ObjectState.Free;
        };
        StarLogic.prototype.ontouchstart = // タッチを開始した際の処理。
        function (scene, e) {
            var s = this.starShape;
            if(this.state.objectState !== ObjectState.PrepareLaunch) {
                s.x -= s.width;
                s.y -= s.height;
                s.radius *= 2;
                s.width *= 2;
                s.height *= 2;
                s.baseColor.a = 0.3;
                this.state.objectState = ObjectState.PrepareLaunch;
            }
            return true;
        };
        StarLogic.prototype.ontouchend = // タッチして離されたとき、その時点での領域にかかっている星を
        // 消して、自身を拡大する。
        function (scene, e) {
            var _this = this;
            if(this.state.objectState === ObjectState.PrepareLaunch) {
                return false;
            }
            var s = this.starShape;
            var contain = scene.entities.filter(function (elem) {
                if(elem === s) {
                    return false;
                }
                var distance = _this.starShape.radius * 2;
                return _this.starShape.within(elem, distance);
            });
            contain.forEach(function (elem) {
                scene.removeEntity(elem);
            });
            // 剛体の情報を更新する。
            var s = this.starShape;
            s.x -= s.radius;
            s.y -= s.radius;
            s.radius *= 2;
            s.width *= 2;
            s.height *= 2;
            s.body.SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
            s.body.DestroyFixture(s.body.GetFixtureList());
            var fixDef = this._fixDef;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(s.radius / this._scale);
            s.body.CreateFixture(fixDef);
            // 準備段階は終了とする
            this.state.objectState = ObjectState.PrepareLaunch;
            return true;
        };
        return StarLogic;
    })();    
    // メインのオブジェクトとなるStar
    var Star = (function (_super) {
        __extends(Star, _super);
        function Star() {
                _super.call(this);
            this.baseData = new animation.Renderer.Circle.Data(0, 0, StarUtil.getSomeSize());
            this._renderer = new animation.Renderer.Circle.CircleRenderer(this.baseData);
            this._logic = new StarLogic(this);
            util.propBind([
                util.binder("x"), 
                {
                    name: "y"
                }, 
                {
                    name: "zIndex"
                }, 
                {
                    name: "width"
                }, 
                {
                    name: "height"
                }, 
                {
                    name: "visible"
                }, 
                {
                    name: "radius"
                }
            ], this, this.baseData);
        }
        Object.defineProperty(Star.prototype, "color", {
            set: function (col) {
                this.baseData.color = col;
            },
            enumerable: true,
            configurable: true
        });
        Star.prototype.isValid = function () {
            return true;
        };
        Star.prototype.isConnectable = function () {
            return this._logic.isConnectable();
        };
        Star.prototype.onreflect = // bodyからデータを反映させる際に呼び出されるコールバック
        function () {
            return this._logic.onreflect();
        };
        Star.prototype.render = // starをレンダリングする。レンダリング処理自体は、circleのrenderに任せる。
        function (context) {
            var r = this.baseData.radius;
            var grad = new animation.Gradietion.Radial(context);
            grad.from(this.x + r * 0.7, this.y + r * 0.5, 1).to(this.x + r, this.y + r, r);
            var info = this.body.GetUserData();
            // 連結している場合は、灰色ベースの色にしてしまう
            switch(this._logic.state.objectState) {
                case ObjectState.Connected:
                    grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").colorStop(1.0, "#000");
                    break;
                case ObjectState.PrepareLaunch:
                    grad.colorStop(0.0, this.baseData.color.toFillStyle()).colorStop(1.0, this.baseData.color.toFillStyle());
                    break;
                default:
                    grad.colorStop(0.0, "#fff").colorStop(0.5, this.baseData.color.toFillStyle()).colorStop(1.0, "#000");
            }
            this.baseData.gradient = grad;
            this._renderer.render(context);
        };
        Star.prototype.createFixture = // 渡されたstarに適合するbodyの設定を作成する。
        function (scale) {
            var fixDef = this._fixDef;
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.userData = this._state;
            bodyDef.position.Set((this.x + this.width / 2) / scale, (this.y + this.height / 2) / scale);
            bodyDef.angularVelocity = (Math.random() * 2 % 2 ? -1 : 1) * 10;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.width / 2 / scale);
            this._logic.scale = scale;
            return {
                bodyDef: bodyDef,
                fixtureDef: fixDef
            };
        };
        Star.prototype.makeTouchStartHandler = // ontouchstartのハンドラを作成して返す。
        function (scene) {
            var _this = this;
            return function (e) {
                return _this._logic.ontouchstart(scene, e);
            };
        };
        Star.prototype.makeTouchEndHandler = // ontouchendのハンドラを作成して返す
        function (scene) {
            var _this = this;
            return function (e) {
                return _this._logic.ontouchend(scene, e);
            };
        };
        return Star;
    })(gl.BaseClasses.EntityImpl);
    GameObj.Star = Star;    
    var StarCaseOption = (function () {
        function StarCaseOption() {
            // 左右両壁の幅
            this.sideWallThickness = 10;
            // 地面の厚み
            this.groundThickness = 10;
        }
        return StarCaseOption;
    })();
    GameObj.StarCaseOption = StarCaseOption;    
    // width / heightにあてはまるオブジェクトを生成する。
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
            // ここで作成される剛体は、見ためのSpriteの倍に相当する剛体とする
            this.wallShapes.push(this.createShape(scale, -sideThick, 0, sideThick * 2, this.height * 2));
            this.wallShapes.push(this.createShape(scale, this.width - sideThick, 0, sideThick * 2, this.height * 2));
            this.wallShapes.push(this.createShape(scale, 0, this.height - ground, this.width * 2, ground * 2));
            this.leftBound = sideThick;
            this.rightBound = this.width - sideThick;
            this.groundBound = this.height - ground;
        };
        StarCase.prototype.createWall = // 壁に相当するspriteを作る
        function (x, y, w, h) {
            var p = new animation.Shapes.Box(w, h);
            p.x = x;
            p.y = y;
            return new gl.BaseClasses.EntityProxy(p);
        };
        StarCase.prototype.createShape = // 壁に相当する剛体を作る。
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
//@ sourceMappingURL=firework.js.map
