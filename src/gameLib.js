var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "util"], function(require, exports, __util__) {
    /// <reference path='../lib/Box2dWeb.d.ts' />
    var util = __util__;

    
    var EventConstants = (function () {
        function EventConstants() { }
        EventConstants.TOUCH_START = "ontouchstart";
        EventConstants.ENTER_FRAME = "onenterframe";
        EventConstants.TOUCH_END = "ontouchend";
        EventConstants.REMOVE = "remove";
        return EventConstants;
    })();
    exports.EventConstants = EventConstants;    
    // ã‚¤ãƒ™ãƒ³ãƒˆã®å¯¾è±¡ã¨ãªã‚‹ã“ã¨ãŒã§ãã‚‹ã‚ªãƒ–ã‚¸ã‚§ã‚¯ãƒˆã®å®Ÿè£…
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
    // ã‚²ãƒ¼ãƒ å†…ã‚·ãƒ¼ãƒ³ã®æ§‹æˆå˜ä½ã€‚å„ã‚·ãƒ¼ãƒ³é–“ã§ã€ç™»éŒ²ã•ã‚Œã¦ã„ã‚‹ã‚ªãƒ–ã‚¸ã‚§ã‚¯ãƒˆãªã©ã¯ç‹¬ç«‹ã—ã¦ã„ã‚‹ã€‚
    var SceneImpl = (function (_super) {
        __extends(SceneImpl, _super);
        function SceneImpl() {
                _super.call(this);
            // å„ã‚·ãƒ¼ãƒ³ã«å­˜åœ¨ã™ã‚‹ã‚ªãƒ–ã‚¸ã‚§ã‚¯ãƒˆ
            this._correctedEntities = [];
            this._noncorrectedEntities = [];
        }
        Object.defineProperty(SceneImpl.prototype, "entities", {
            get: function () {
                return this._correctedEntities;
            },
            enumerable: true,
            configurable: true
        });
        SceneImpl.prototype.addEntity = /**
        * ç®¡ç†å¯¾è±¡ã®entityã‚’è¿½åŠ ã™ã‚‹
        */
        function (entity) {
            if(entity && entity.enableCorrect) {
                entity.scene = this;
                this._correctedEntities.push(entity);
            } else if(entity) {
                this._noncorrectedEntities.push(entity);
            }
        };
        SceneImpl.prototype.removeEntity = /**
        * æŒ‡å®šã•ã‚ŒãŸEntityã‚’å‰Šé™¤ã™ã‚‹
        */
        function (entity) {
            if(entity !== null && entity.enableCorrect) {
                util.remove(this._correctedEntities, entity);
                entity.listener.fire(EventConstants.REMOVE, null);
            } else {
                util.remove(this._noncorrectedEntities, entity);
                entity.listener.fire(EventConstants.REMOVE, null);
            }
        };
        SceneImpl.prototype.render = // æŒ‡å®šã•ã‚ŒãŸcontextã«å¯¾ã—ã¦ãƒ¬ãƒ³ãƒ€ãƒªãƒ³ã‚°ã‚’è¡Œã†
        function (context) {
            context.clear();
            this._correctedEntities.forEach(function (elem) {
                return elem.render(context);
            });
            this._noncorrectedEntities.forEach(function (elem) {
                return elem.render(context);
            });
        };
        return SceneImpl;
    })(EventTargetImpl);
    exports.SceneImpl = SceneImpl;    
    (function (BaseClasses) {
        // æ¸¡ã•ã‚ŒãŸSymbolã‚ªãƒ–ã‚¸ã‚§ã‚¯ãƒˆã‚’ã€Entityã¨ã—ã¦æ‰±ã†ãŸã‚ã®ãƒ—ãƒ­ã‚­ã‚·ã‚¯ãƒ©ã‚¹ã€‚
        var EntityProxy = (function () {
            function EntityProxy(symbol) {
                this.enableCorrect = true;
                this.scene = null;
                this._symbol = symbol;
                this.listener = new EventTargetImpl();
            }
            Object.defineProperty(EntityProxy.prototype, "x", {
                get: // å„ãƒ—ãƒ­ãƒ‘ãƒ†ã‚£ã«å¯¾ã™ã‚‹getter
                function () {
                    return this._symbol.x;
                },
                set: // å„ãƒ—ãƒ­ãƒ‘ãƒ†ã‚£ã«å¯¾ã™ã‚‹setter
                function (_x) {
                    this._symbol.x = _x;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EntityProxy.prototype, "y", {
                get: function () {
                    return this._symbol.y;
                },
                set: function (_y) {
                    this._symbol.y = _y;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EntityProxy.prototype, "width", {
                get: function () {
                    return this._symbol.width;
                },
                set: function (_width) {
                    this._symbol.width = _width;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EntityProxy.prototype, "height", {
                get: function () {
                    return this._symbol.height;
                },
                set: function (_height) {
                    this._symbol.height = _height;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EntityProxy.prototype, "zIndex", {
                get: function () {
                    return this._symbol.zIndex;
                },
                set: function (_z) {
                    this._symbol.zIndex = _z;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EntityProxy.prototype, "visible", {
                get: function () {
                    return this._symbol.visible;
                },
                set: function (v) {
                    this._symbol.visible = v;
                },
                enumerable: true,
                configurable: true
            });
            EntityProxy.prototype.moveBy = function (x, y) {
                this._symbol.moveBy(x, y);
            };
            EntityProxy.prototype.moveTo = function (x, y) {
                this._symbol.moveTo(x, y);
            };
            EntityProxy.prototype.render = function (context) {
                this._symbol.render(context);
            };
            EntityProxy.prototype.intersect = function (other) {
                return Intersector.intersect(this, other);
            };
            EntityProxy.prototype.within = function (other, distance) {
                if (typeof distance === "undefined") { distance = -1; }
                return Intersector.within(this, other, distance);
            };
            return EntityProxy;
        })();
        BaseClasses.EntityProxy = EntityProxy;        
        // EntityåŒå£«ã®è¡çªåˆ¤å®šå‡¦ç†ã‚’ã¾ã¨ã‚ã¦æä¾›ã™ã‚‹ã‚¯ãƒ©ã‚¹ã€‚ã“ã®ã‚¯ãƒ©ã‚¹è‡ªä½“ã«å½±éŸ¿ã™ã‚‹ã‚ˆã†ãª
        // å‡¦ç†ã¯å­˜åœ¨ã—ãªã„
        (function (Intersector) {
            // äºŒã¤ã®çŸ©å½¢ã«å¯¾ã™ã‚‹ã‚ãŸã‚Šåˆ¤å®šã‚’è¡Œã†ã€‚è§¦ã‚Œã¦ã„ã‚‹çŠ¶æ…‹ã®å ´åˆã¯ã€intersectã¨ã¯åˆ¤å®šã—ãªã„
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
            // ã¡ã‚‡ã†ã©distanceã®è·é›¢ã¨ãªã‚‹å ´åˆã¯ã€withinã¨åˆ¤å®šã—ãªã„
            function within(one, other, distance) {
                if (typeof distance === "undefined") { distance = -1; }
                if(distance === -1) {
                    // distanceãŒè¨­å®šã•ã‚Œãªã„å ´åˆã€äº’ã„ã®width/heightã®å¹³å‡å€¤ãŒåˆ©ç”¨ã•ã‚Œã‚‹
                    distance = (one.width + other.width + one.height + other.height) / 4;
                }
                // Entityã®x/yåº§æ¨™ã¯ã€ã™ã¹ã¦çŸ©å½¢ã®å·¦ä¸Šåº§æ¨™ã‚’è¡¨ã™ãŸã‚ã€ä¸€åº¦ãã‚Œãžã‚Œã®ä¸­å¿ƒåº§æ¨™ã‚’è¨ˆç®—ã™ã‚‹ã€‚
                var vec = animation.Common.Vector;
                var oneC = new vec.Vector2D(one.x + one.width / 2, one.y + one.height / 2);
                var otherC = new vec.Vector2D(other.x + other.width / 2, other.y + other.height / 2);
                var dist = oneC.sub(otherC).norm();
                return dist < distance;
            }
            Intersector.within = within;
        })(BaseClasses.Intersector || (BaseClasses.Intersector = {}));
        var Intersector = BaseClasses.Intersector;
        // Entityã®åŸºæœ¬å®Ÿè£…ã‚’æä¾›ã™ã‚‹ã€‚Entityã¯ã€ã‚¤ãƒ™ãƒ³ãƒˆã‚’å—ã‘ã‚‹ã“ã¨ãŒå¯èƒ½ã€‚
        var EntityImpl = (function (_super) {
            __extends(EntityImpl, _super);
            function EntityImpl() {
                _super.call(this);
                this.enableCorrect = true;
                this.scene = null;
                this.listener = new EventTargetImpl();
            }
            EntityImpl.prototype.intersect = // äºŒã¤ã®çŸ©å½¢ã«å¯¾ã™ã‚‹ã‚ãŸã‚Šåˆ¤å®šã‚’è¡Œã†ã€‚è§¦ã‚Œã¦ã„ã‚‹çŠ¶æ…‹ã®å ´åˆã¯ã€intersectã¨ã¯åˆ¤å®šã—ãªã„
            function (other) {
                return Intersector.intersect(this, other);
            };
            EntityImpl.prototype.within = // ã¡ã‚‡ã†ã©distanceã®è·é›¢ã¨ãªã‚‹å ´åˆã¯ã€withinã¨åˆ¤å®šã—ãªã„
            function (other, distance) {
                if (typeof distance === "undefined") { distance = -1; }
                return Intersector.within(this, other, distance);
            };
            return EntityImpl;
        })(animation.Symbol);
        BaseClasses.EntityImpl = EntityImpl;        
    })(exports.BaseClasses || (exports.BaseClasses = {}));
    var BaseClasses = exports.BaseClasses;
    // ãƒ•ãƒ¬ãƒ¼ãƒ ãƒ™ãƒ¼ã‚¹ã§ã®æ›´æ–°å‡¦ç†ã‚’æä¾›ã™ã‚‹ã‚²ãƒ¼ãƒ ã‚¯ãƒ©ã‚¹ã€‚ãƒ¬ãƒ³ãƒ€ãƒªãƒ³ã‚°ãŒå‘¼ã³å‡ºã•ã‚Œã‚‹ã‚¿ã‚¤ãƒŸãƒ³ã‚°
    // ã«ã¤ã„ã¦ã‚‚ã€ã“ã“ã§æŒ‡å®šã—ãŸãƒ•ãƒ¬ãƒ¼ãƒ ã®ã‚¿ã‚¤ãƒŸãƒ³ã‚°ã¨ãªã‚‹
    var Game = (function () {
        function Game(width, height) {
            this.width = width;
            this.height = height;
            var _this = this;
            // ãƒ‡ãƒ•ã‚©ãƒ«ãƒˆã®FPS
            this._fps = 30;
            this._isGameStarted = false;
            // å„ã‚·ãƒ¼ãƒ³ã®stack
            this._sceneStack = [];
            // å†…éƒ¨ã§ä½œæˆã™ã‚‹canvasã®ID
            this._gameCanvasId = "game-canvas";
            // game.startæ™‚ã«ä¸€åº¦ã ã‘å®Ÿè¡Œã•ã‚Œã‚‹ã€‚æœ€åˆã®startæ™‚ã«ã®ã¿å‘¼ã³å‡ºã•ã‚Œã‚‹ãŸã‚ã€
            // ä¸€åº¦stopã—ã¦ã‹ã‚‰å†åº¦startã—ã¦ã‚‚å®Ÿè¡Œã•ã‚Œãªã„
            this.onload = null;
            // ãƒ¬ãƒ³ãƒ€ãƒªãƒ³ã‚°å¯¾è±¡ã¨ãªã‚‹Canvasã‚’è¿½åŠ ã™ã‚‹
            var elem = document.createElement("canvas");
            elem.id = this._gameCanvasId;
            elem.setAttribute("width", width.toString());
            elem.setAttribute("height", height.toString());
            // ã‚¿ãƒƒãƒ/ãƒžã‚¦ã‚¹ã§ãã‚Œãžã‚ŒåŒä¸€ã®ãƒãƒ³ãƒ‰ãƒ©ã‚’åˆ©ç”¨ã™ã‚‹
            elem.addEventListener("touchstart", function (e) {
                _this.currentScene.fire(EventConstants.TOUCH_START, e);
            });
            elem.addEventListener("mousedown", function (e) {
                _this.currentScene.fire(EventConstants.TOUCH_START, e);
            });
            elem.addEventListener("mouseup", function (e) {
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
            get: // Sceneã‚¹ã‚¿ãƒƒã‚¯ã¯ã€æœ€ä½Žä¸€ã¤å¿…ãšç©ã¾ã‚Œã¦ã„ã‚‹
            function () {
                return this._sceneStack[this._sceneStack.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Game.prototype.start = /**
        * ã‚²ãƒ¼ãƒ ãƒ«ãƒ¼ãƒ—ã‚’é–‹å§‹ã™ã‚‹ã€‚
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
                _this.currentScene.fire(EventConstants.ENTER_FRAME, null);
                _this.render();
            }, 1000 / this._fps);
            this._isGameStarted = true;
        };
        Game.prototype.stop = /**
        * é–‹å§‹ã•ã‚ŒãŸã‚²ãƒ¼ãƒ ãƒ«ãƒ¼ãƒ—ã‚’åœæ­¢ã™ã‚‹ã€‚
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
        Game.prototype.popScene = // ã‚¹ã‚¿ãƒƒã‚¯ã‹ã‚‰Sceneã‚’popã™ã‚‹ã€‚ãŸã ã—ã€ç¾åœ¨ã®sceneãŒrootã§ã‚ã‚‹å ´åˆã¯ã€
        // popã•ã‚Œãšã«nullãŒè¿”ã•ã‚Œã‚‹
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
    // Box2DWebã‚’ãƒ©ãƒƒãƒ”ãƒ³ã‚°ã—ã¦åˆ©ç”¨ã—ã‚„ã™ãã—ãŸã‚¯ãƒ©ã‚¹ã‚’æä¾›ã™ã‚‹ãƒ¢ã‚¸ãƒ¥ãƒ¼ãƒ«
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
            World.prototype.add = // æ¸¡ã•ã‚ŒãŸbinderã‚’ç™»éŒ²ã™ã‚‹ã€‚binderãŒã¾ã bindã•ã‚Œã¦ã„ãªã„å ´åˆã€
            // è‡ªèº«ã‚’bindã®å¼•æ•°ã¨ã—ã¦ã‹ã‚‰ç™»éŒ²ã™ã‚‹ã€‚
            function (binder) {
                if(!binder.binded) {
                    binder.bind(this);
                }
                this._binders.push(binder);
            };
            World.prototype.addBody = // æŒ‡å®šã—ãŸBodyDefã«åŸºã¥ã„ãŸBodyã‚’è¿½åŠ ã—ã€è¿½åŠ ã—ãŸBodyã‚’è¿”ã™ã€‚
            function (def) {
                var body = this._world.CreateBody(def.bodyDef);
                body.CreateFixture(def.fixtureDef);
                return body;
            };
            World.prototype.remove = // æŒ‡å®šã—ãŸtargetã‚’æŒã¤adapterã‚’å‰Šé™¤ã™ã‚‹ã€‚
            function (target) {
                if(target !== null) {
                    util.remove(this._binders, target);
                    this.removeBody(target.body);
                }
            };
            World.prototype.removeBody = // æŒ‡å®šã—ãŸBodyã‚’ç’°å¢ƒã‹ã‚‰å–ã‚Šé™¤ãã€‚
            function (body) {
                this._world.DestroyBody(body);
            };
            World.prototype.step = // ç‰©ç†ä¸–ç•Œã®çŠ¶æ³ã‚’æ›´æ–°ã™ã‚‹ã€‚
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
        // BodyBindableã¨Bodyã‚’bindã™ã‚‹ã‚¯ãƒ©ã‚¹ã€‚
        // å®Ÿéš›ã«ã¯BodyDefinitionã®ã¿ã‚’æ¸¡ã—ã€bodyç”Ÿæˆã¯bindãƒ¡ã‚½ãƒƒãƒ‰ã®å‘¼ã³å‡ºã—æ™‚ã«ã€
        // æ¸¡ã•ã‚ŒãŸworldã«ã¤ã„ã¦è¡Œã†ã€‚
        // Worldã«ã‚ˆã£ã¦æ›´æ–°ã•ã‚ŒãŸBodyã®çŠ¶æ…‹ã‚’ã€BodyBindableã«åæ˜ ã™ã‚‹ã€‚
        var BodyBinder = (function () {
            function BodyBinder(target, bodyDef) {
                // ã™ã§ã«bodyç”ŸæˆãŒè¡Œãªã‚ã‚Œã¦ã„ã‚‹å ´åˆã¯true
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
            BodyBinder.prototype.bind = // æ¸¡ã•ã‚ŒãŸbodyDefinitonã‹ã‚‰bodyã‚’ç”Ÿæˆã—ã€ç”Ÿæˆã—ãŸBodyã¨
            // ã‚ªãƒ–ã‚¸ã‚§ã‚¯ãƒˆã‚’çµã³ã¤ã‘ã‚‹ã€‚
            function (world) {
                if(!this._binded) {
                    this._body = world.addBody(this._bodyDef);
                    this._target.body = this._body;
                    this._binded = true;
                }
            };
            BodyBinder.prototype.reflectBodyState = // Bodyã®ç¾åœ¨ã®ä½ç½®ã‚’targetã«åæ˜ ã™ã‚‹ã€‚
            // worldScaleã¯ã€Bodyã®ä½ç½®ãƒ»ã‚µã‚¤ã‚ºã‚’1ã¨ã—ã¦ã€pixelã«å¤‰æ›ã™ã‚‹éš›ã®ä¿‚æ•°ã€‚
            // 1 meter / 100 pixelãªã‚‰ã°ã€100ã¨ã™ã‚‹ã€‚
            function (worldScale) {
                var bodyPos = this._body.GetPosition(), me = this._target;
                if(me.onreflect()) {
                    // å‰›ä½“ã®åº§æ¨™ã¯ã€ç‰©ä½“ã®æœ¬æ¥ã®ä½ç½®ã¨ä¸€è‡´ã™ã‚‹ã‚ˆã†ã«èª¿æ•´ã•ã‚Œã¦ã„ã‚‹ãŸã‚ã€
                    // åæ˜ ã®éš›ã«ã¯ä¿®æ­£ã—ãŸå€¤ã‚’è¨­å®šã™ã‚‹ã€‚
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
//@ sourceMappingURL=gameLib.js.map
