var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "animation", "gameLib"], function(require, exports, __animation__, __gl__) {
    var animation = __animation__;

    
    var gl = __gl__;

    var Gravity = 0.098;
    // 実際に花火が炸裂する前に実行される、
    var TracerLight = (function () {
        // 始点を決定する。
        function TracerLight(x, y) {
            this.x = x;
            this.y = y;
            // 曲線を書く際に利用する点の保存数
            this._trackingPointNum = 8;
            // 昇るスピード
            this._speed = 4;
            // x座標の振幅l
            this._sinRatio = 3.5;
            // 曲線を書く際に利用する点
            this._trackingPointQueue = [];
            this._sins = [
                0, 
                Math.PI / 4, 
                Math.PI / 2, 
                Math.PI * 0.75, 
                Math.PI, 
                Math.PI * 1.25, 
                Math.PI * 1.5, 
                Math.PI * 1.75, 
                Math.PI * 2
            ];
            this._prevPoint = {
                x: x,
                y: y
            };
        }
        TracerLight.prototype.getTracerExpireFrame = // Tracerの生存フレームを返す。
        function () {
            var expire = Math.max(Math.random() * 60 % 60, 20);
            return expire;
        };
        TracerLight.prototype.addTrackingPoint = // 軌跡の描画用点を追加する。
        function (point) {
            this._trackingPointQueue.push(point);
            if(this._trackingPointQueue.length > this._trackingPointNum) {
                this._trackingPointQueue.shift();
            }
        };
        TracerLight.prototype.updateEffect = // エフェクト情報を更新する
        function (frame) {
            // トラッキングする点を更新する。
            this._speed *= 0.98;
            this.y -= this._speed;
            // 点は、フレーム毎に正弦波での振幅を加算する。
            var sin = this._sins[frame % this._sins.length];
            this.addTrackingPoint({
                x: this.x + Math.sin(sin) * this._sinRatio,
                y: this.y
            });
        };
        TracerLight.prototype.getTracerColor = function (alpha) {
            if(Math.random() < 0.1) {
                return new animation.Common.Color(255, 255, 150, alpha * 2);
            } else {
                return new animation.Common.Color(255, 255, 230, alpha);
            }
        };
        TracerLight.prototype.render = function (context) {
            var _this = this;
            // 軌跡を描画する。
            var c = context.context;
            var alpha = 1.0;
            var prevPoint = this._prevPoint;
            c.beginPath();
            this._trackingPointQueue.forEach(function (point) {
                c.strokeStyle = _this.getTracerColor(alpha).toFillStyle();
                c.lineWidth = 3;
                c.lineTo(point.x, point.y);
                prevPoint = point;
                alpha *= 0.8;
            });
            c.stroke();
            this._prevPoint = prevPoint;
        };
        return TracerLight;
    })();    
    // 火花の色を管理する。
    var ColorEffect = (function () {
        function ColorEffect(baseColor) {
            // 全体の透明度
            this._alpha = 0.8;
            this._color = new animation.Common.Color();
            var hsv = animation.Common.Color.rgbToHsv(baseColor);
            this._hue = hsv.h;
            this._color = animation.Common.Color.hsvToRgb(this._hue, 100, 100);
            this._hueEffect = Math.floor(Math.random() * 60 - 30);
        }
        ColorEffect.prototype.updateEffect = function (frame) {
            if(frame > 8) {
                this._alpha *= 0.92;
            }
            // 3フレーム毎に、色相を変化させる
            if(frame % 3 == 0) {
                this._hue = (this._hue + this._hueEffect) % 360;
                this._color = animation.Common.Color.hsvToRgb(this._hue, 100, 100);
            }
        };
        ColorEffect.prototype.getSparkColor = function () {
            if(Math.random() < 0.1) {
                return new animation.Common.Color(255, 255, 150, this._alpha * 2);
            } else {
                return new animation.Common.Color(255, 255, 230, this._alpha);
            }
        };
        ColorEffect.prototype.getStrokeColor = function () {
            var ret = new animation.Common.Color();
            ret.copy(this._color);
            ret.a = this._alpha * 0.8;
            return ret;
        };
        return ColorEffect;
    })();    
    var Spark = (function (_super) {
        __extends(Spark, _super);
        function Spark(x, y, speed, expire, effect) {
                _super.call(this);
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.expire = expire;
            this.tracking = [];
            this.swap = 0;
            this.frame = 0;
            this.tracking.push({
                x: x,
                y: y
            });
            this.tracking.push({
                x: x,
                y: y
            });
            this._effect = effect;
            // ベクトルを正規化する
            var rnd = Math.random();
            var theta = Math.sqrt(1 - rnd * rnd);
            var phai = 2 * Math.PI * Math.random();
            this.vx = 1 * theta * Math.cos(phai) * speed;
            this.vy = 1 * theta * Math.sin(phai) * speed;
            this.vz = 1 * rnd * speed;
            this.data = new animation.Renderer.Box.Data(this.x, this.y, 4, 4);
            this.renderer = new animation.Renderer.Box.BoxRenderer(this.data);
        }
        Spark.swappingFrame = 10;
        Spark.prototype.start = function () {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.92;
            this.vy *= 0.92;
            if(++this.frame % Spark.swappingFrame === 0) {
                this.swap = this.swap ^ 1;
                this.tracking[this.swap].x = this.x;
                this.tracking[this.swap].y = this.y;
            }
        };
        Spark.prototype.end = function () {
            this.vy += Gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.96;
            this.vy *= 0.96;
            if(++this.frame % Spark.swappingFrame === 0) {
                this.swap = this.swap ^ 1;
                this.tracking[this.swap].x = this.x;
                this.tracking[this.swap].y = this.y;
            }
        };
        Spark.prototype.render = function (context) {
            // 軌跡を描画する。
            var c = context.context;
            var last = this.swap ^ 1;
            var pivot = this.swap;
            c.strokeStyle = this._effect.getStrokeColor().toFillStyle();
            c.lineWidth = 3;
            c.beginPath();
            c.moveTo(this.tracking[last].x, this.tracking[last].y);
            c.lineTo(this.tracking[pivot].x, this.tracking[pivot].y);
            c.stroke();
            c.beginPath();
            c.moveTo(this.tracking[pivot].x, this.tracking[pivot].y);
            c.lineTo(this.x, this.y);
            c.stroke();
            this.data.color = this._effect.getSparkColor();
            this.data.x = this.x;
            this.data.y = this.y;
            this.renderer.render(context);
        };
        return Spark;
    })(gl.BaseClasses.EntityImpl);    
    // 花火のエフェクト全体を提供するためのクラス
    var StarMineImpl = (function (_super) {
        __extends(StarMineImpl, _super);
        function StarMineImpl(x, y, baseColor) {
                _super.call(this);
            this.x = x;
            this.y = y;
            this._sparks = [];
            this._renderSpark = false;
            this._colorEffect = new ColorEffect(baseColor);
            this._tracer = new TracerLight(x, y);
        }
        StarMineImpl.prototype.setup = function () {
            var _this = this;
            var frame = 0;
            this.tl.repeat(this._tracer.getTracerExpireFrame(), function () {
                _this._tracer.updateEffect(++frame);
            }).then(function () {
                frame = 0;
                _this._renderSpark = true;
                for(var i = 0; i < 50; ++i) {
                    _this._sparks.push(new Spark(_this._tracer.x, _this._tracer.y, 5, 300, _this._colorEffect));
                }
            }).repeat(10, function () {
                _this._colorEffect.updateEffect(++frame);
                _this._sparks.forEach(function (elem) {
                    elem.start();
                });
            }).repeat(100, function () {
                _this._colorEffect.updateEffect(++frame);
                _this._sparks.forEach(function (elem) {
                    elem.end();
                });
            }).then(function () {
                _this.scene.removeEntity(_this);
            });
        };
        StarMineImpl.prototype.render = function (context) {
            if(this._renderSpark) {
                this._sparks.forEach(function (elem) {
                    elem.render(context);
                });
            } else {
                this._tracer.render(context);
            }
        };
        return StarMineImpl;
    })(gl.BaseClasses.EntityImpl);
    exports.StarMineImpl = StarMineImpl;    
})
