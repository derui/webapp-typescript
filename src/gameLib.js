var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "animation"], function(require, exports, __animation__) {
    
    var animation = __animation__;

    // フレームベースでの更新処理を提供するゲームクラス。レンダリングが呼び出されるタイミング
    // についても、ここで指定したフレームのタイミングとなる
    var Game = (function () {
        function Game(width, height) {
            this.width = width;
            this.height = height;
            var _this = this;
            // デフォルトのFPS
            this._fps = 30;
            // FPSにおける各フレームに入った段階で実行される関数
            this._onenterframe = null;
            this._onload = null;
            this._ontouch = null;
            this._isGameStarted = false;
            // 内部で動作させるentity
            this._entities = [];
            // 内部で作成するcanvasのID
            this._gameCanvasId = "game-canvas";
            // レンダリング対象となるCanvasを追加する
            var elem = document.createElement("canvas");
            elem.id = this._gameCanvasId;
            elem.setAttribute("width", width.toString());
            elem.setAttribute("height", height.toString());
            document.body.appendChild(elem);
            // タッチ/マウスでそれぞれ同一のハンドラを利用する
            elem.addEventListener("touchstart", function (e) {
                if(_this._ontouch != null) {
                    _this._ontouch(_this, e);
                }
            });
            elem.addEventListener("click", function (e) {
                if(_this._ontouch != null) {
                    _this._ontouch(_this, e);
                }
            });
            this._engine = new animation.RenderingEngine(this._gameCanvasId);
        }
        Object.defineProperty(Game.prototype, "fps", {
            get: function () {
                return this._fps;
            },
            set: function (f) {
                this._fps = f;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "onEnterFrame", {
            set: function (f) {
                this._onenterframe = f;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "onload", {
            set: function (f) {
                this._onload = f;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "ontouch", {
            set: function (f) {
                this._ontouch = f;
            },
            enumerable: true,
            configurable: true
        });
        Game.prototype.start = /**
        * ゲームループを開始する。
        */
        function () {
            var _this = this;
            if(this._isGameStarted) {
                return;
            }
            if(this._onload) {
                this._onload(this);
            }
            this._intervalHandle = window.setInterval(function () {
                if(_this._onenterframe) {
                    _this._onenterframe(_this);
                }
                _this.render();
            }, 1000 / this._fps);
            this._isGameStarted = true;
        };
        Game.prototype.stop = /**
        * 開始されたゲームループを停止する。
        */
        function () {
            window.clearInterval(this._intervalHandle);
            this._intervalHandle = null;
            this._isGameStarted = false;
        };
        Game.prototype.addEntity = /**
        * 管理対象のentityを追加する
        */
        function (entity) {
            this._entities.push(entity);
            this._engine.addEntity(entity);
        };
        Game.prototype.removeEntity = /**
        * 指定されたEntityを削除する
        */
        function (entity) {
            var index = this._entities.indexOf(entity);
            this._entities.splice(index, 1);
        };
        Game.prototype.render = function () {
            this._engine.renderEntities();
        };
        return Game;
    })();
    exports.Game = Game;    
    (function (Physics) {
        var World = (function () {
            function World(gravity, sleep) {
                if (typeof sleep === "undefined") { sleep = true; }
                this._worldScale = 100;
                this._binders = [];
                this._world = new Box2D.Dynamics.b2World(gravity, sleep);
            }
            Object.defineProperty(World.prototype, "worldScale", {
                get: function () {
                    return this._worldScale;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(World.prototype, "gravity", {
                get: function () {
                    return this._world.GetGravity();
                },
                set: function (vec) {
                    return this._world.SetGravity(vec);
                },
                enumerable: true,
                configurable: true
            });
            World.prototype.add = // 渡されたbinderを登録する。binderがまだbindされていない場合、
            // 自身をbindの引数としてから登録する。
            function (binder) {
                if(!binder.binded) {
                    binder.bind(this);
                }
                this._binders.push(binder);
            };
            World.prototype.addBody = // 指定したBodyDefに基づいたBodyを追加し、追加したBodyを返す。
            function (def) {
                var body = this._world.CreateBody(def.bodyDef);
                body.CreateFixture(def.fixtureDef);
                return body;
            };
            World.prototype.remove = // 指定したtargetを持つadapterを削除する。
            function (target) {
                this._binders = this._binders.filter(function (value, index, array) {
                    array[index] != target;
                });
            };
            World.prototype.removeBody = // 指定したBodyを環境から取り除く。
            function (body) {
                this._world.DestroyBody(body);
            };
            World.prototype.step = // 物理世界の状況を更新する。
            function (rate, velocity, position) {
                var _this = this;
                this._world.Step(rate, velocity, position);
                this._world.ClearForces();
                this._binders.forEach(function (value, index, ary) {
                    ary[index].reflectBodyState(_this._worldScale);
                });
            };
            return World;
        })();
        Physics.World = World;        
        // BodyBindableとBodyをbindするクラス。
        // 実際にはBodyDefinitionのみを渡し、body生成はbindメソッドの呼び出し時に、
        // 渡されたworldについて行う。
        // Worldによって更新されたBodyの状態を、BodyBindableに反映する。
        var BodyBinder = (function () {
            function BodyBinder(target, bodyDef) {
                // すでにbody生成が行なわれている場合はtrue
                this._binded = false;
                this._target = target;
                this._bodyDef = bodyDef;
            }
            Object.defineProperty(BodyBinder.prototype, "binded", {
                get: function () {
                    return this._binded;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BodyBinder.prototype, "target", {
                get: function () {
                    return this._target;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BodyBinder.prototype, "body", {
                get: function () {
                    return this._body;
                },
                enumerable: true,
                configurable: true
            });
            BodyBinder.prototype.bind = // 渡されたbodyDefinitonからbodyを生成し、生成したBodyと
            // オブジェクトを結びつける。
            function (world) {
                if(!this._binded) {
                    this._body = world.addBody(this._bodyDef);
                    this._target.body = this._body;
                    this._binded = true;
                }
            };
            BodyBinder.prototype.reflectBodyState = // Bodyの現在の位置をtargetに反映する。
            // worldScaleは、Bodyの位置・サイズを1として、pixelに変換する際の係数。
            // 1 meter / 100 pixelならば、100とする。
            function (worldScale) {
                var bodyPos = this._body.GetPosition(), me = this._target;
                if(me.onreflect()) {
                    // 剛体の座標は、物体の本来の位置と一致するように調整されているため、
                    // 反映の際には修正した値を設定する。
                    me.x = bodyPos.x * worldScale - me.width / 2;
                    me.y = bodyPos.y * worldScale - me.height / 2;
                }
            };
            return BodyBinder;
        })();
        Physics.BodyBinder = BodyBinder;        
    })(exports.Physics || (exports.Physics = {}));
    var Physics = exports.Physics;
    (function (Firework) {
        var ObjectType;
        (function (ObjectType) {
            ObjectType._map = [];
            ObjectType._map[0] = "Wall";
            ObjectType.Wall = 0;
            ObjectType._map[1] = "Star";
            ObjectType.Star = 1;
        })(ObjectType || (ObjectType = {}));
        var ObjectState;
        (function (ObjectState) {
            ObjectState._map = [];
            ObjectState._map[0] = "Connected";
            ObjectState.Connected = 0;
            ObjectState._map[1] = "Free";
            ObjectState.Free = 1;
            ObjectState._map[2] = "PrepareLaunch";
            ObjectState.PrepareLaunch = 2;
            ObjectState._map[3] = "Launch";
            ObjectState.Launch = 3;
        })(ObjectState || (ObjectState = {}));
        // B2BodyのuserDataに登録する情報
        var ObjectInfo = (function () {
            function ObjectInfo(type) {
                this.type = type;
                this.objectState = ObjectState.Free;
            }
            return ObjectInfo;
        })();        
        // メインのオブジェクトとなるStar
        var Star = (function (_super) {
            __extends(Star, _super);
            function Star(radius) {
                        _super.call(this, radius);
                this._color = new Base.Color();
            }
            Star._fixDef = (function () {
                var fix = new Box2D.Dynamics.b2FixtureDef();
                fix.density = 1.0// 密度
                ;
                fix.friction = 1.5// 摩擦係数
                ;
                fix.restitution = 0.2// 反発係数
                ;
                return fix;
            })();
            Star.prototype.isValid = function () {
                return true;
            };
            Star.prototype.setColor = function (color) {
                this._color = color;
            };
            Star.prototype.onreflect = function () {
                var body = this.body;
                var count = 0;
                var contacts = [];
                for(var n = body.GetContactList(); n != null; n = n.next) {
                    if(n.contact.IsTouching()) {
                        contacts.push(n.other);
                    }
                }
                // 星同士が4つ以上隣接したら、staticに変更する。
                if(contacts.length >= 4) {
                    contacts.forEach(function (e) {
                        var info = e.GetUserData();
                        info.objectState = ObjectState.Connected;
                        if(body != e && info.type == ObjectType.Star) {
                            e.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                        }
                    });
                    body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                    var info = body.GetUserData();
                    info.objectState = ObjectState.Connected;
                }
                return true;
            };
            Star.prototype.render = function (context) {
                var r = this.radius;
                var grad = new animation.Gradietion.Radial(context);
                grad.from(this.x + r * 0.7, this.y + r * 0.5, 1).to(this.x + r, this.y + r, r);
                var info = this.body.GetUserData();
                if(info.objectState != ObjectState.Connected) {
                    grad.colorStop(0.0, "#fff").colorStop(0.5, this._color.toFillStyle()).colorStop(1.0, "#000");
                } else {
                    grad.colorStop(0.0, "#fff").colorStop(0.8, "#888").colorStop(1.0, "#000");
                }
                this.gradient = grad;
                _super.prototype.render.call(this, context);
            };
            Star.createFixture = // 渡されたstarに適合するbodyの設定を作成する。
            function createFixture(target, scale) {
                var fixDef = this._fixDef;
                var bodyDef = new Box2D.Dynamics.b2BodyDef();
                bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
                bodyDef.userData = new ObjectInfo(ObjectType.Star);
                bodyDef.position.Set((target.x + target.width / 2) / scale, (target.y + target.height / 2) / scale);
                bodyDef.angularVelocity = (Math.random() * 2 % 2 ? -1 : 1) * 10;
                fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(target.width / 2 / scale);
                return {
                    bodyDef: bodyDef,
                    fixtureDef: fixDef
                };
            };
            return Star;
        })(animation.Shapes.Circle);
        Firework.Star = Star;        
        var StarCaseOption = (function () {
            function StarCaseOption() {
                // 左右両壁の幅
                this.sideWallThickness = 10;
                // 地面の厚み
                this.groundThickness = 10;
            }
            return StarCaseOption;
        })();
        Firework.StarCaseOption = StarCaseOption;        
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
                return p;
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
        Firework.StarCase = StarCase;        
    })(exports.Firework || (exports.Firework = {}));
    var Firework = exports.Firework;
    // canvas element only.
    (function (Base) {
        var Color = (function () {
            function Color(r, g, b, a) {
                if (typeof r === "undefined") { r = 0; }
                if (typeof g === "undefined") { g = 0; }
                if (typeof b === "undefined") { b = 0; }
                if (typeof a === "undefined") { a = 1.0; }
                this.r = r;
                this.g = g;
                this.b = b;
                this.a = a;
            }
            Color.prototype.toFillStyle = function () {
                var colors = [
                    this.r.toString(), 
                    this.g.toString(), 
                    this.b.toString(), 
                    this.a.toString()
                ].join(',');
                return "rgba(" + colors + ")";
            };
            return Color;
        })();
        Base.Color = Color;        
    })(exports.Base || (exports.Base = {}));
    var Base = exports.Base;
})
