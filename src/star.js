var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "util", "animation", "gameLib", "firework", "starmine"], function(require, exports, __util__, __animation__, __gl__, __fw__, __starmine__) {
    var util = __util__;

    var animation = __animation__;

    var gl = __gl__;

    var fw = __fw__;

    var I = util.Illiegals;
    var starmine = __starmine__;

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
    // Starに係るロジック周辺の処理を担当する。
    // StarLogic自体はStarにコンポジションされているが、
    // StarLogicにもStarが渡されている。
    var StarLogic = (function () {
        function StarLogic(starShape, data) {
            this.starShape = starShape;
            this.data = data;
            // 各starで共通するFixtureDefinition
            this._fixDef = (function () {
                var fix = new Box2D.Dynamics.b2FixtureDef();
                fix.density = 1.0// 密度
                ;
                fix.friction = 1.5// 摩擦係数
                ;
                fix.restitution = 0.2// 反発係数
                ;
                return fix;
            })();
            this.state = new fw.ObjectInfo(fw.ObjectType.Star);
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
                    return info_e.objectState == fw.ObjectState.Free;
                }).forEach(function (e) {
                    var info_e = e.GetUserData();
                    info_e.objectState = fw.ObjectState.Connected;
                    if(body != e && info_e.type == fw.ObjectType.Star) {
                        e.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                    }
                });
                body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                var info = body.GetUserData();
                info.objectState = fw.ObjectState.Connected;
                return false;
            }
            return true;
        };
        StarLogic.prototype.isConnectable = function () {
            return this.state.objectState === fw.ObjectState.Free;
        };
        StarLogic.prototype.ontouchstart = // タッチを開始した際の処理。
        function (scene, e) {
            var s = this.starShape;
            if(this.state.objectState === fw.ObjectState.Connected) {
                s.x -= s.width;
                s.y -= s.height;
                this.data.radius *= 2;
                s.width *= 2;
                s.height *= 2;
                this.data.color.a = 0.3;
                this.state.objectState = fw.ObjectState.Touched;
            }
            return true;
        };
        StarLogic.prototype.ontouchend = // タッチして離されたとき、その時点での領域にかかっている星を
        // 消して、自身を拡大する。
        // ただし、領域内に、すでにLaunch状態になっているものがある場合は
        // 元に戻る。
        function (scene, e) {
            var _this = this;
            if(this.state.objectState !== fw.ObjectState.Touched) {
                return false;
            }
            var s = this.starShape;
            var contain = scene.entities.filter(function (elem) {
                if(elem === s) {
                    return false;
                }
                return s.within(elem, _this.data.radius);
            });
            // 広がった中に存在しなければ、大きさを元に戻す。
            if(contain.length === 0) {
                this.data.radius /= 2;
                s.width /= 2;
                s.height /= 2;
                this.state.objectState = fw.ObjectState.Connected;
                return false;
            }
            contain.forEach(function (elem) {
                scene.removeEntity(elem);
            });
            // 剛体の情報を更新する。
            s.body.SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
            s.body.DestroyFixture(s.body.GetFixtureList());
            var fixDef = this._fixDef;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.data.radius / this.scale);
            s.body.CreateFixture(fixDef);
            // 準備段階は終了とする
            this.state.objectState = fw.ObjectState.PrepareLaunch;
            var baseColor = new animation.Common.Color();
            baseColor.copy(this.data.color);
            this.data.color.r = 255;
            this.data.color.g = 40;
            this.data.color.b = 40;
            var ratio = 128 / gl.Game.instance.fps;
            var downFunc = function () {
                _this.data.color.r -= ratio;
                _this.data.color.r = Math.floor(_this.data.color.r);
                if(_this.data.color.r <= 128) {
                    _this.data.color.r = 128;
                }
            };
            var upFunc = function () {
                _this.data.color.r += ratio;
                _this.data.color.r = Math.floor(_this.data.color.r);
                if(_this.data.color.r >= 255) {
                    _this.data.color.r = 255;
                }
            };
            this.starShape.tl.repeat(gl.Game.instance.fps, downFunc).repeat(gl.Game.instance.fps, upFunc).repeat(gl.Game.instance.fps, downFunc).repeat(gl.Game.instance.fps, upFunc).then(function () {
                var mine = new starmine.StarMineImpl(_this.starShape.x + _this.data.radius, _this.starShape.y + _this.data.radius, baseColor);
                mine.enableCorrect = false;
                _this.starShape.scene.addEntity(mine);
                mine.setup();
                _this.starShape.scene.removeEntity(_this.starShape);
            });
            return true;
        };
        StarLogic.prototype.createFixture = // 渡されたstarに適合するbodyの設定を作成する。
        function (scale) {
            var fixDef = this._fixDef;
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.userData = this.state;
            bodyDef.position.Set((this.data.x + this.data.width / 2) / scale, (this.data.y + this.data.height / 2) / scale);
            bodyDef.angularVelocity = (Math.random() * 2 % 2 ? -1 : 1) * 10;
            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.data.width / 2 / scale);
            this.scale = scale;
            return {
                bodyDef: bodyDef,
                fixtureDef: fixDef
            };
        };
        return StarLogic;
    })();    
    var Renderer;
    (function (Renderer) {
        // 通常状態のStarをレンダリングする。
        var NormalStarRenderer = (function () {
            function NormalStarRenderer(data) {
                this.data = data;
                this._renderer = new animation.Renderer.Circle.CircleRenderer(this.data);
            }
            NormalStarRenderer.prototype.render = function (context) {
                var r = this.data.radius;
                var d = this.data;
                var grad = new animation.Gradation.Radial(context);
                grad.from(d.x + r * 0.7, d.y + r * 0.5, 1).to(d.x + r, d.y + r, r);
                grad.colorStop(0.0, "#fff").colorStop(0.5, d.color.toFillStyle()).colorStop(0.9, "#000").colorStop(1.0, "#333");
                d.gradient = grad;
                this._renderer.render(context);
            };
            return NormalStarRenderer;
        })();        
        // 連結状態のStarをレンダリングする。
        var ConnectedStarRenderer = (function () {
            function ConnectedStarRenderer(data) {
                this.data = data;
                this._renderer = new animation.Renderer.Circle.CircleRenderer(this.data);
            }
            ConnectedStarRenderer.prototype.render = function (context) {
                var r = this.data.radius;
                var d = this.data;
                var grad = new animation.Gradation.Radial(context);
                grad.from(d.x + r * 0.7, d.y + r * 0.5, 1).to(d.x + r, d.y + r, r);
                grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").colorStop(0.9, "#000").colorStop(1.0, "#333");
                d.gradient = grad;
                this._renderer.render(context);
            };
            return ConnectedStarRenderer;
        })();        
        // PrepareLaunch状態のレンダリングを行う。
        var PrepareLaunchRenderer = (function () {
            function PrepareLaunchRenderer(data) {
                this.data = data;
                this._renderer = new animation.Renderer.Circle.CircleRenderer(this.data);
            }
            PrepareLaunchRenderer.prototype.render = function (context) {
                var r = this.data.radius;
                var d = this.data;
                var grad = new animation.Gradation.Radial(context);
                grad.from(d.x + r * 0.7, d.y + r * 0.5, 1).to(d.x + r, d.y + r, r);
                grad.colorStop(0.0, d.color.toFillStyle()).colorStop(1.0, d.color.toFillStyle());
                this.data.gradient = grad;
                this._renderer.render(context);
            };
            return PrepareLaunchRenderer;
        })();        
        // Starで利用するrenderの切り替えをコントロールするためのクラス
        var StarRenderController = (function () {
            function StarRenderController(data) {
                this.data = data;
                this._renderStock = [];
                this._renderStock.push({
                    state: fw.ObjectState.Free,
                    render: new NormalStarRenderer(data)
                });
                this._renderStock.push({
                    state: fw.ObjectState.Touched,
                    render: new NormalStarRenderer(data)
                });
                this._renderStock.push({
                    state: fw.ObjectState.Connected,
                    render: new ConnectedStarRenderer(data)
                });
                this._renderStock.push({
                    state: fw.ObjectState.PrepareLaunch,
                    render: new PrepareLaunchRenderer(data)
                });
            }
            StarRenderController.prototype.getRenderer = function (state) {
                var render = this._renderStock.filter(function (elem) {
                    return elem.state === state;
                });
                return render.length === 0 ? new animation.NullRenderable() : render[0].render;
            };
            return StarRenderController;
        })();
        Renderer.StarRenderController = StarRenderController;        
    })(Renderer || (Renderer = {}));
    // メインのオブジェクトとなるStar
    var Star = (function (_super) {
        __extends(Star, _super);
        function Star() {
                _super.call(this);
            this.data = new animation.Renderer.Circle.Data(0, 0, StarUtil.getSomeSize());
            this._controller = new Renderer.StarRenderController(this.data);
            this._logic = new StarLogic(this, this.data);
            // バインドしておく
            I.propBind([
                I.binder("x"), 
                I.binder("y"), 
                I.binder("zIndex"), 
                I.binder("width"), 
                I.binder("height"), 
                I.binder("visible"), 
                I.binder("color")
            ], this, this.data);
        }
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
            this._controller.getRenderer(this._logic.state.objectState).render(context);
        };
        Star.prototype.createFixture = function (scale) {
            return this._logic.createFixture(scale);
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
    exports.Star = Star;    
})
