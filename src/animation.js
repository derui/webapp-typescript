var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    // canvas element only.
    (function (Common) {
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
        Common.Color = Color;        
        var Rect = (function () {
            function Rect(left, top, right, bottom) {
                this.left = left;
                this.top = top;
                this.right = right;
                this.bottom = bottom;
                this.center = this.calcCenter();
            }
            Object.defineProperty(Rect.prototype, "center", {
                get: function () {
                    return this.calcCenter();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Rect.prototype, "width", {
                get: function () {
                    return this.left - this.right;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Rect.prototype, "height", {
                get: function () {
                    return this.bottom - this.top;
                },
                enumerable: true,
                configurable: true
            });
            Rect.prototype.calcCenter = function () {
                var width = this.right - this.left, height = this.bottom - this.top;
                return new Vector.Vector2D(this.left + width / 2, this.top + height / 2);
            };
            Rect.prototype.set = function (left, top, right, bottom) {
                this.left = left;
                this.top = top;
                this.right = right;
                this.bottom = bottom;
            };
            return Rect;
        })();
        Common.Rect = Rect;        
        (function (Vector) {
            // 二次元ベクトルを返す。基本的にチェーンメソッドで繋げられるようになっている。
            var Vector2D = (function () {
                function Vector2D(x, y) {
                    this.x = x;
                    this.y = y;
                }
                Vector2D.prototype.normalize = // このオブジェクトをnormalizeしたものを返す。
                function () {
                    var norm = this.norm();
                    this.x /= norm;
                    this.y /= norm;
                    return this;
                };
                Vector2D.prototype.norm = function () {
                    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
                };
                Vector2D.prototype.dot = function (v) {
                    if(v == null) {
                        return 0;
                    }
                    return this.x * v.x + this.y * v.y;
                };
                Vector2D.prototype.add = // 自身に渡されたベクトルを加算した新しいベクトルを返す
                function (v) {
                    return new Vector2D(this.x + v.x, this.y + v.y);
                };
                Vector2D.prototype.sub = // 自身に渡されたベクトルを減算した新しいベクトルを返す
                function (v) {
                    return new Vector2D(this.x - v.x, this.y - v.y);
                };
                Vector2D.prototype.scale = // 自身をscaleしたVectorを返す
                function (s) {
                    this.x *= s;
                    this.y *= s;
                    return this;
                };
                Vector2D.prototype.invert = // 自身を逆向きにして、自身を返す。
                function () {
                    this.x *= -1;
                    this.y *= -1;
                    return this;
                };
                return Vector2D;
            })();
            Vector.Vector2D = Vector2D;            
        })(Common.Vector || (Common.Vector = {}));
        var Vector = Common.Vector;
    })(exports.Common || (exports.Common = {}));
    var Common = exports.Common;
    // 描画可能なオブジェクトの基底クラス
    var Symbol = (function () {
        // それぞれの値について、初期値を設定する責任は、このクラスを継承した先のクラスにある
        function Symbol(x, y, width, height, visible, zIndex) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            if (typeof width === "undefined") { width = 0; }
            if (typeof height === "undefined") { height = 0; }
            if (typeof visible === "undefined") { visible = true; }
            if (typeof zIndex === "undefined") { zIndex = 0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.visible = visible;
            this.zIndex = zIndex;
        }
        Symbol.prototype.render = // このクラスのレンダリングは何も行わない
        function (context) {
        };
        Symbol.prototype.moveBy = function (x, y) {
            this.x += x;
            this.y += y;
        };
        Symbol.prototype.moveTo = function (x, y) {
            this.x = x;
            this.y = y;
        };
        return Symbol;
    })();
    exports.Symbol = Symbol;    
    // レンダリングターゲットに対して、各種のアニメーションを管理するための
    // singletonなクラス
    // アニメーションを実行したいオブジェクトは、Animaから生成されるアニメーションオブジェクト
    // を取得し、各フレームごとにAnimaの更新処理を行うことで、全体のアニメーションを、時間ベースで
    // 一極管理することができる。
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
            Linear.prototype.clear = function () {
                this._fromX = 0;
                this._fromY = 0;
                this._toX = 0;
                this._toY = 0;
            };
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
            Radial.prototype.clear = function () {
                this._fromX = 0;
                this._fromY = 0;
                this._fromR = 0;
                this._toX = 0;
                this._toY = 0;
                this._toR = 0;
            };
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
                this.baseColor = new Common.Color();
                this.x = 0;
                this.y = 0;
                this.width = radius * 2;
                this.height = radius * 2;
                this.zIndex = 0;
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
                // 設定可能ではない場合は、baseColorを改めて設定する
                if(this._gradient) {
                    ctx.fillStyle = this._gradient.raw();
                } else {
                    ctx.fillStyle = this.baseColor.toFillStyle();
                }
                ctx.beginPath();
                ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2, true);
                ctx.fill();
            };
            return Circle;
        })(Symbol);
        Shapes.Circle = Circle;        
        // 矩形
        var Box = (function (_super) {
            __extends(Box, _super);
            function Box(width, height) {
                        _super.call(this);
                this.width = width;
                this.height = height;
                this.isFill = true;
                this.x = 0;
                this.y = 0;
                this.zIndex = 0;
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
        })(Symbol);
        Shapes.Box = Box;        
    })(exports.Shapes || (exports.Shapes = {}));
    var Shapes = exports.Shapes;
})
