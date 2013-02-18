var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    
    // 描画可能なオブジェクトの基底クラス
    var EntityBase = (function () {
        function EntityBase() {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.zIndex = 0;
        }
        EntityBase.prototype.render = // このクラスのレンダリングは何も行わない
        function (context) {
        };
        return EntityBase;
    })();
    exports.EntityBase = EntityBase;    
    var RenderingEngine = (function () {
        function RenderingEngine() {
            this._shapeList = [];
        }
        RenderingEngine.prototype.addEntity = function (entity) {
            if(entity != null) {
                this._shapeList.push(entity);
            }
        };
        RenderingEngine.prototype.removeEntity = function (entity) {
            if(entity != null) {
                var indexOf = this._shapeList.indexOf(entity);
                this._shapeList.splice(indexOf, 1);
            }
        };
        RenderingEngine.prototype.renderEntities = function (context) {
            if(context != null) {
                context.clear();
                for(var i = 0; i < this._shapeList.length; ++i) {
                    this._shapeList[i].render(context);
                }
            }
        };
        return RenderingEngine;
    })();
    exports.RenderingEngine = RenderingEngine;    
    // レンダリングターゲットに対して、各種のアニメーションを管理するための
    // singletonなクラス
    var Anima = (function () {
        function Anima() { }
        Anima._instance = null;
        Anima.getInstance = function getInstance() {
            if(this._instance == null) {
                this._instance = new Anima();
            }
            return this._instance;
        };
        return Anima;
    })();
    exports.Anima = Anima;    
    // 描画オブジェクトの描画先となるコンテキストクラス
    var Context = (function () {
        function Context(canvas) {
            this._width = 0;
            this._height = 0;
            if(canvas) {
                this._context = canvas.getContext("2d");
                this._width = canvas.width;
                this._height = canvas.height;
            } else {
                this._context = null;
            }
        }
        Object.defineProperty(Context.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Context.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Context.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });
        Context.prototype.contextEnabled = function () {
            return this._context != null;
        };
        Context.prototype.clear = function () {
            this._context.clearRect(0, 0, this._width, this._height);
        };
        return Context;
    })();
    exports.Context = Context;    
    var InvalidCanvasException = (function () {
        function InvalidCanvasException(message) {
            this.message = message;
        }
        return InvalidCanvasException;
    })();
    exports.InvalidCanvasException = InvalidCanvasException;    
    // CanvasGradientをラッピングしたクラスを提供するモジュール
    (function (Gradietion) {
        // 線形グラディエーションクラス
        var Linear = (function () {
            function Linear(context) {
                if(context.contextEnabled) {
                    this._context = context;
                }
            }
            Linear.prototype.from = function (x, y) {
                this._fromX = x;
                this._fromY = y;
                return this;
            };
            Linear.prototype.to = function (x, y) {
                this._toX = x;
                this._toY = y;
                return this;
            };
            Linear.prototype.colorStop = function (offset, color) {
                if(this._context == null) {
                    throw new InvalidCanvasException("Invalid canvas");
                }
                if(this._linearGradient == null) {
                    this._linearGradient = this._context.context.createLinearGradient(this._fromX, this._fromY, this._toX, this._toY);
                }
                this._linearGradient.addColorStop(offset, color);
                return this;
            };
            Linear.prototype.raw = function () {
                return this._linearGradient;
            };
            return Linear;
        })();
        Gradietion.Linear = Linear;        
        // 円形グラディエーションクラス
        var Radial = (function () {
            function Radial(context) {
                if(context.contextEnabled) {
                    this._context = context;
                }
            }
            Radial.prototype.from = function (x, y, r) {
                this._fromX = x;
                this._fromY = y;
                this._fromR = r;
                return this;
            };
            Radial.prototype.to = function (x, y, r) {
                this._toX = x;
                this._toY = y;
                this._toR = r;
                return this;
            };
            Radial.prototype.colorStop = function (offset, color) {
                if(this._context == null) {
                    throw new InvalidCanvasException("Invalid canvas");
                }
                if(this._radialGradient == null) {
                    this._radialGradient = this._context.context.createRadialGradient(this._fromX, this._fromY, this._fromR, this._toX, this._toY, this._toR);
                }
                this._radialGradient.addColorStop(offset, color);
                return this;
            };
            Radial.prototype.raw = function () {
                return this._radialGradient;
            };
            return Radial;
        })();
        Gradietion.Radial = Radial;        
    })(exports.Gradietion || (exports.Gradietion = {}));
    var Gradietion = exports.Gradietion;
    var Util;
    (function (Util) {
        // save〜restoreをラップしたクラスを提供する
        var ContextWrapper = (function () {
            function ContextWrapper(context, callback) {
                if(callback != null && context != null) {
                    context.context.save();
                    callback(context);
                    context.context.restore();
                }
            }
            return ContextWrapper;
        })();
        Util.ContextWrapper = ContextWrapper;        
    })(Util || (Util = {}));
    // Canvasのコンテキストをベースにした各種図形の描画機能を提供する
    (function (Shapes) {
        // 円
        var Circle = (function (_super) {
            __extends(Circle, _super);
            function Circle(radius) {
                        _super.call(this);
                this.radius = radius;
                this.width = radius * 2;
                this.height = radius * 2;
            }
            Object.defineProperty(Circle.prototype, "gradient", {
                set: function (g) {
                    this._gradient = g;
                },
                enumerable: true,
                configurable: true
            });
            Circle.prototype.render = function (context) {
                var ctx = context.context;
                // グラディエーションが設定可能である場合は設定する
                if(this._gradient) {
                    ctx.fillStyle = this._gradient.raw();
                }
                ctx.beginPath();
                ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2, true);
                ctx.fill();
            };
            return Circle;
        })(EntityBase);
        Shapes.Circle = Circle;        
        // 矩形
        var Box = (function (_super) {
            __extends(Box, _super);
            function Box(width, height) {
                        _super.call(this);
                this.width = width;
                this.height = height;
                this.isFill = true;
            }
            Object.defineProperty(Box.prototype, "gradient", {
                set: function (g) {
                    this._gradient = g;
                },
                enumerable: true,
                configurable: true
            });
            Box.prototype.render = function (context) {
                var _this = this;
                new Util.ContextWrapper(context, function (context) {
                    var ctx = context.context;
                    // グラディエーションが設定可能である場合は設定する
                    if(_this._gradient) {
                        ctx.fillStyle = _this._gradient.raw();
                    }
                    if(_this.isFill) {
                        ctx.fillRect(_this.x, _this.y, _this.width, _this.height);
                    } else {
                        ctx.rect(_this.x, _this.y, _this.width, _this.height);
                    }
                });
            };
            return Box;
        })(EntityBase);
        Shapes.Box = Box;        
    })(exports.Shapes || (exports.Shapes = {}));
    var Shapes = exports.Shapes;
})
