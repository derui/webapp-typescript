var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "animation", "gameLib"], function(require, exports, __animation__, __gl__) {
    var animation = __animation__;

    
    var gl = __gl__;

    var Gravity = 0.098;
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
            ret.a = this._alpha * 0.7;
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
            this.data = new animation.Renderer.Box.Data(this.x, this.y, 2, 2);
            this.data.color.r = 255;
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
            this._colorEffect = new ColorEffect(baseColor);
            for(var i = 0; i < 50; ++i) {
                this._sparks.push(new Spark(x, y, 5, 300, this._colorEffect));
            }
        }
        StarMineImpl.prototype.setup = function () {
            var _this = this;
            var frame = 0;
            this.tl.repeat(10, function () {
                _this._colorEffect.updateEffect(++frame);
                _this._sparks.forEach(function (elem) {
                    elem.start();
                });
            }).repeat(100, function () {
                _this._colorEffect.updateEffect(++frame);
                _this._sparks.forEach(function (elem) {
                    elem.end();
                });
            });
            this.tl.then(function () {
                _this.scene.removeEntity(_this);
            });
        };
        StarMineImpl.prototype.render = function (context) {
            this._sparks.forEach(function (elem) {
                elem.render(context);
            });
        };
        return StarMineImpl;
    })(gl.BaseClasses.EntityImpl);
    exports.StarMineImpl = StarMineImpl;    
})
