var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "util", "animation"], function(require, exports, __util__, __animation__) {
    /// <reference path='../lib/Box2dWeb.d.ts' />
    var util = __util__;

    var animation = __animation__;

    
    var EventConstants = (function () {
        function EventConstants() { }
        EventConstants.TOUCH_START = "ontouchstart";
        EventConstants.ENTER_FRAME = "onenterframe";
        EventConstants.TOUCH_END = "ontouchend";
        EventConstants.REMOVE = "remove";
        return EventConstants;
    })();
    exports.EventConstants = EventConstants;    
    // イベントの対象となることができるオブジェクトの実装
    var EventTargetImpl = (function () {
        function EventTargetImpl() {
            this._listeners = {
            };
        }
        EventTargetImpl.prototype.addListener = function (event, f) {
            this._listeners[event] = f;
        };
        EventTargetImpl.prototype.on = function (event, f) {
            this._listeners[event] = f;
        };
        EventTargetImpl.prototype.removeListener = function (event) {
            this._listeners[event] = null;
        };
        EventTargetImpl.prototype.fire = function (event, e) {
            if(this._listeners[event]) {
                this._listeners[event](e);
            }
        };
        return EventTargetImpl;
    })();
    exports.EventTargetImpl = EventTargetImpl;    
    // ゲーム内シーンの構成単位。各シーン間で、登録されているオブジェクトなどは独立している。
    var SceneImpl = (function (_super) {
        __extends(SceneImpl, _super);
        function SceneImpl() {
                _super.call(this);
            // 各シーンに存在するオブジェクト
            this._correctedEntities = [];
            this._nonCorrectedEntities = [];
        }
        Object.defineProperty(SceneImpl.prototype, "entities", {
            get: function () {
                return this._correctedEntities;
            },
            enumerable: true,
            configurable: true
        });
        SceneImpl.prototype.addEntity = /**
        * 管理対象のentityを追加する
        */
        function (entity) {
            if(entity != null && entity.enableCorrect) {
                entity.scene = this;
                this._correctedEntities.push(entity);
            } else if(entity) {
                entity.scene = this;
                this._nonCorrectedEntities.push(entity);
            }
            // タイムラインに登録する
            if(entity != null) {
                this._correctedEntities.push(entity);
                entity.tl = animation.Anima.add(entity);
                ;
            }
        };
        SceneImpl.prototype.removeEntity = /**
        * 指定されたEntityを削除する
        */
        function (entity) {
            if(entity !== null && entity.enableCorrect) {
                util.remove(this._correctedEntities, entity);
                entity.listener.fire(EventConstants.REMOVE, null);
            } else {
                util.remove(this._nonCorrectedEntities, entity);
                entity.listener.fire(EventConstants.REMOVE, null);
            }
            // アニメーションタイムラインから削除する
            if(entity !== null) {
                animation.Anima.remove(entity);
            }
        };
        SceneImpl.prototype.render = // 指定されたcontextに対してレンダリングを行う
        function (context) {
            context.clear();
            context.context.fillStyle = "rgba(0,0,0,1)";
            context.context.fillRect(0, 0, context.width, context.height);
            this._correctedEntities.forEach(function (elem) {
                return elem.render(context);
            });
            this._nonCorrectedEntities.forEach(function (elem) {
                return elem.render(context);
            });
        };
        SceneImpl.prototype.doFrame = // 指定されたcontextに対してレンダリングを行う
        function () {
            this.fire(EventConstants.ENTER_FRAME, null);
            // タイムライン自体は、それぞれ独立しているため、Animaによる
            // tickを行う
            animation.Anima.tickFrame();
        };
        return SceneImpl;
    })(EventTargetImpl);
    exports.SceneImpl = SceneImpl;    
    (function (BaseClasses) {
        // Entity同士の衝突判定処理をまとめて提供するクラス。このクラス自体に影響するような
        // 処理は存在しない
        (function (Intersector) {
            // 二つの矩形に対するあたり判定を行う。触れている状態の場合は、intersectとは判定しない
            function intersect(one, other) {
                if(one == null || other == null) {
                    return false;
                }
                var rectone = {
                    left: one.x,
                    top: one.y,
                    right: one.x + one.width,
                    bottom: one.y + one.height
                }, rectOther = {
                    left: other.x,
                    top: other.y,
                    right: other.x + other.width,
                    bottom: other.y + other.height
                };
                if(rectone.right <= rectOther.left) {
                    return false;
                } else if(rectone.left >= rectOther.right) {
                    return false;
                } else if(rectone.bottom <= rectOther.top) {
                    return false;
                } else if(rectone.top >= rectOther.bottom) {
                    return false;
                } else {
                    return true;
                }
            }
            Intersector.intersect = intersect;
            // ちょうどdistanceの距離となる場合は、withinと判定しない
            function within(one, other, distance) {
                if (typeof distance === "undefined") { distance = -1; }
                if(distance === -1) {
                    // distanceが設定されない場合、互いのwidth/heightの平均値が利用される
                    distance = (one.width + other.width + one.height + other.height) / 4;
                }
                // Entityのx/y座標は、すべて矩形の左上座標を表すため、一度それぞれの中心座標を計算する。
                var vec = animation.Common.Vector;
                var oneC = new vec.Vector2D(one.x + one.width / 2, one.y + one.height / 2);
                var otherC = new vec.Vector2D(other.x + other.width / 2, other.y + other.height / 2);
                var dist = oneC.sub(otherC).norm();
                return dist < distance;
            }
            Intersector.within = within;
        })(BaseClasses.Intersector || (BaseClasses.Intersector = {}));
        var Intersector = BaseClasses.Intersector;
        // Entityの基本実装を提供する。Entityは、イベントを受けることが可能。
        var EntityImpl = (function (_super) {
            __extends(EntityImpl, _super);
            function EntityImpl() {
                        _super.call(this);
                this.enableCorrect = true;
                this.scene = null;
                this.listener = new EventTargetImpl();
            }
            EntityImpl.prototype.intersect = // 二つの矩形に対するあたり判定を行う。触れている状態の場合は、intersectとは判定しない
            function (other) {
                return Intersector.intersect(this, other);
            };
            EntityImpl.prototype.within = // ちょうどdistanceの距離となる場合は、withinと判定しない
            function (other, distance) {
                if (typeof distance === "undefined") { distance = -1; }
                return Intersector.within(this, other, distance);
            };
            return EntityImpl;
        })(animation.Symbol);
        BaseClasses.EntityImpl = EntityImpl;        
    })(exports.BaseClasses || (exports.BaseClasses = {}));
    var BaseClasses = exports.BaseClasses;
    // フレームベースでの更新処理を提供するゲームクラス。レンダリングが呼び出されるタイミング
    // についても、ここで指定したフレームのタイミングとなる
    var Game = (function () {
        function Game(width, height) {
            this.width = width;
            this.height = height;
            var _this = this;
            // デフォルトのFPS
            this._fps = 30;
            this._isGameStarted = false;
            // 各シーンのstack
            this._sceneStack = [];
            // 内部で作成するcanvasのID
            this._gameCanvasId = "game-canvas";
            // game.start時に一度だけ実行される。最初のstart時にのみ呼び出されるため、
            // 一度stopしてから再度startしても実行されない
            this.onload = null;
            // レンダリング対象となるCanvasを追加する
            var elem = document.createElement("canvas");
            elem.id = this._gameCanvasId;
            elem.setAttribute("width", width.toString());
            elem.setAttribute("height", height.toString());
            // タッチ/マウスでそれぞれ同一のハンドラを利用する
            elem.addEventListener("touchstart", function (e) {
                _this.currentScene.fire(EventConstants.TOUCH_START, e);
            });
            elem.addEventListener("mousedown", function (e) {
                _this.currentScene.fire(EventConstants.TOUCH_START, e);
            });
            elem.addEventListener("mouseup", function (e) {
                _this.currentScene.fire(EventConstants.TOUCH_END, e);
            });
            elem.addEventListener("touchend", function (e) {
                _this.currentScene.fire(EventConstants.TOUCH_END, e);
            });
            var canvas = elem;
            this._targetContext = new animation.Context(canvas);
            document.body.appendChild(elem);
            this._sceneStack.push(new SceneImpl());
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
        Object.defineProperty(Game.prototype, "currentScene", {
            get: // Sceneスタックは、最低一つ必ず積まれている
            function () {
                return this._sceneStack[this._sceneStack.length - 1];
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
            if(this.onload !== null && !this._isGameStarted) {
                this.onload(this);
            }
            this._intervalHandle = window.setInterval(function () {
                _this.currentScene.doFrame();
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
        Game.prototype.pushScene = function (scene) {
            if(scene !== null) {
                this._sceneStack.push(scene);
            }
        };
        Game.prototype.popScene = // スタックからSceneをpopする。ただし、現在のsceneがrootである場合は、
        // popされずにnullが返される
        function () {
            if(this._sceneStack.length == 1) {
                return null;
            } else {
                return this._sceneStack.pop();
            }
        };
        Game.prototype.render = function () {
            this.currentScene.render(this._targetContext);
        };
        return Game;
    })();
    exports.Game = Game;    
    // Box2DWebをラッピングして利用しやすくしたクラスを提供するモジュール
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
                if(target != null) {
                    util.remove(this._binders, target);
                    this.removeBody(target.body);
                }
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
})
