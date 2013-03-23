
import animation = module("animation");
import timeline = module("timeline");
import gl = module("gameLib");

// 実体は持たず、他に干渉はしない、花火エフェクトを提供するためのクラス
export interface StarMine extends gl.Entity {
    setup() : void;
}

var Gravity = 0.098;

// 実際に花火が炸裂する前に実行される、
class TracerLight {

    // 曲線を書く際に利用する点の保存数
    private _trackingPointNum : number = 8;

    // 昇るスピード
    private _speed : number = 4;

    // x座標の振幅l
    private _sinRatio : number = 3.5;

    // 曲線を書く際に利用する点
    private _trackingPointQueue : {x:number;y:number;}[] = [];

    private _sins : number[] = [0, Math.PI / 4, Math.PI / 2,
                                Math.PI * 0.75, Math.PI,
                                Math.PI * 1.25, Math.PI * 1.5,
                                Math.PI * 1.75, Math.PI * 2];

    private _prevPoint : {x:number;y:number;};

    // 始点を決定する。
    constructor(public x: number, public y:number) {
        this._prevPoint = {x:x, y:y};
    }

    // 軌跡の描画用点を追加する。
    addTrackingPoint(point: {x:number;y:number;}) : void {
        this._trackingPointQueue.push(point);
        if (this._trackingPointQueue.length > this._trackingPointNum) {
            this._trackingPointQueue.shift();
        }
    }

    // エフェクト情報を更新する
    updateEffect(frame:number): void {
        // トラッキングする点を更新する。
        this._speed *= 0.98;
        this.y -= this._speed;

        // 点は、フレーム毎に正弦波での振幅を加算する。
        var sin = this._sins[frame % this._sins.length];
        this.addTrackingPoint({x:this.x + Math.sin(sin) * this._sinRatio,
                               y:this.y});
    }

    getTracerColor(alpha) : animation.Common.Color {
        if (Math.random() < 0.1) {
            return new animation.Common.Color(
                255, 255, 150, alpha * 2);
        } else {
            return new animation.Common.Color(
                255, 255, 230, alpha);
        }
    }

    render(context: animation.Context) : void {
        // 軌跡を描画する。

        var c = context.context;
        var alpha = 1.0;
        var prevPoint = this._prevPoint;
        c.beginPath();

        this._trackingPointQueue.forEach((point) => {
            c.strokeStyle = this.getTracerColor(alpha).toFillStyle();
            c.lineWidth = 3;
            c.moveTo(prevPoint.x, prevPoint.y);
            c.lineTo(point.x, point.y);
            c.stroke();
            prevPoint = point;
            alpha *= 0.8;
        });
        this._prevPoint = prevPoint;
    }

}

// 火花の色を管理する。
class ColorEffect {
    // 色相として利用する値
    private _hue : number; 

    // 色相へのエフェクト
    private _hueEffect : number;

    // 全体の透明度
    private _alpha : number = 0.8;

    private _color : animation.Common.Color = new animation.Common.Color();

    constructor(baseColor: animation.Common.Color) {
        var hsv = animation.Common.Color.rgbToHsv(baseColor);
        this._hue = hsv.h;
        this._color = animation.Common.Color.hsvToRgb(this._hue, 100, 100);
        this._hueEffect = Math.floor(Math.random() * 60 - 30);
    }

    updateEffect(frame:number) :void {
        if (frame > 8) {
            this._alpha *= 0.92;
        }

        // 3フレーム毎に、色相を変化させる
        if (frame % 3 == 0) {
            this._hue = (this._hue + this._hueEffect) % 360;
            this._color = animation.Common.Color.hsvToRgb(this._hue, 100, 100);
        }
    }

    getSparkColor() : animation.Common.Color {
        if (Math.random() < 0.1) {
            return new animation.Common.Color(
                255, 255, 150, this._alpha * 2);
        } else {
            return new animation.Common.Color(
                255, 255, 230, this._alpha);
        }
    }

    getStrokeColor() : animation.Common.Color {
        var ret = new animation.Common.Color;
        ret.copy(this._color);
        ret.a = this._alpha * 0.8;
        return ret;
    }
}

class Spark extends gl.BaseClasses.EntityImpl {

    private vx : number;
    private vy : number;
    private vz : number;

    private tracking : {x:number; y:number;}[] = [];
    private swap : number = 0;

    private renderer : animation.Renderable;
    private data : animation.Renderer.Box.Data;

    private static swappingFrame : number = 10;
    private frame : number = 0;
    private _effect : ColorEffect;

    constructor(public x:number, public y:number, public speed: number,
                public expire: number, effect : ColorEffect) {
        super();
        this.tracking.push({x:x, y:y});
        this.tracking.push({x:x, y:y});
        this._effect = effect;

        // ベクトルを正規化する
        var rnd = Math.random();
        var theta = Math.sqrt(1 - rnd * rnd);
        var phai = 2 * Math.PI * Math.random();
        this.vx = 1 * theta * Math.cos(phai) * speed;
        this.vy = 1 * theta * Math.sin(phai) * speed;
        this.vz = 1 * rnd * speed;

        this.data = new animation.Renderer.Box.Data(this.x, this.y,
                                                    4, 4);
        this.renderer = new animation.Renderer.Box.BoxRenderer(this.data);
    }

    start() : void {

        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.92;
        this.vy *= 0.92;

        if (++this.frame % Spark.swappingFrame === 0) {
            this.swap = this.swap ^ 1;
            this.tracking[this.swap].x = this.x;
            this.tracking[this.swap].y = this.y;
        }
    }

    end() : void {

        this.vy += Gravity;
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.96;
        this.vy *= 0.96;

        if (++this.frame % Spark.swappingFrame === 0) {
            this.swap = this.swap ^ 1;
            this.tracking[this.swap].x = this.x;
            this.tracking[this.swap].y = this.y;
        }
    }

    render(context: animation.Context) : void {
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
    }

}

// 花火のエフェクト全体を提供するためのクラス
export class StarMineImpl extends gl.BaseClasses.EntityImpl implements StarMine {

    private _sparks : Spark[] = [];
    private _colorEffect : ColorEffect;
    private _tracer : TracerLight;
    private _renderSpark = false;

    constructor(public x:number, public y:number, baseColor : animation.Common.Color) {
        super();
        this._colorEffect = new ColorEffect(baseColor);
        this._tracer = new TracerLight(x, y);
    }

    setup() : void {
        var frame = 0;
        this.tl.repeat(30, () => {
            this._tracer.updateEffect(++frame);
        }).then(() => {
            frame = 0;
            this._renderSpark = true;
            for (var i = 0; i < 50; ++i) {
                this._sparks.push(new Spark(
                    this._tracer.x,
                    this._tracer.y, 5, 300, this._colorEffect));
            }
        });
        this.tl.repeat(10, () => {
            this._colorEffect.updateEffect(++frame);
            this._sparks.forEach((elem) => {elem.start();})}).
            repeat(100, () => {
                this._colorEffect.updateEffect(++frame);
                this._sparks.forEach((elem) => {elem.end();})});
        this.tl.then(() => {
            this.scene.removeEntity(this);
        });
    }

    render(context: animation.Context) : void {
        if (this._renderSpark) {
            this._sparks.forEach((elem) => {elem.render(context);});
        } else {
            this._tracer.render(context);
        }
    }
}