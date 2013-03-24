
import tl = module("timeline");
import util = module("util");

// canvas element only.
export module Common {

    export class Color {
        constructor(public r = 0, public g = 0, public b = 0, public a = 1.0) { }

        copy(col:Color) {
            this.r = col.r;
            this.g = col.g;
            this.b = col.b;
            this.a = col.a;
        }

        toFillStyle(): string {
            var colors = [this.r.toString(), this.g.toString(), this.b.toString(), this.a.toString()].join(',');
            return "rgba(" + colors + ")";
        }

        // hsv形式から、rgb形式へ変換する
        static hsvToRgb(h:number, s:number, v:number) : Color {
            var r, g, b;
            var i;
            var f, p, q, t;
            
            h = Math.max(0, Math.min(360, h));
            s = Math.max(0, Math.min(100, s));
            v = Math.max(0, Math.min(100, v));

            s /= 100;
            v /= 100;
            
            if(s == 0) {
                r = g = b = v;
                return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
            }
            
            h /= 60; // sector 0 to 5
            i = Math.floor(h);
            f = h - i; // factorial part of h
            p = v * (1 - s);
            q = v * (1 - s * f);
            t = v * (1 - s * (1 - f));
            
            switch(i) {
            case 0:
                r = v;g = t;b = p;
                break;
            case 1:
                r = q;g = v;b = p;
                break;
            case 2:
                r = p;g = v;b = t;
                break;
            case 3:
                r = p;g = q;b = v;
                break;
            case 4:
                r = t;g = p;b = v;
                break;
            default:
                r = v;g = p;b = q;
                break;
            }
            return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
        }

        // RGB形式から、hsv形式に変換する
        static rgbToHsv(color: Color) : {h:number;s:number;v:number;} {
            var r = color.r, g = color.g, b = color.b;
            var h, s, v;
            
            if (Math.max(r, g) === r) {
                if (Math.max(r, b) === r) {
                    h = 60 * (g - b) / (r - Math.min(g, b)) + 0;
                    s = (r - Math.min(g, b)) / r;
                    v = r;
                } else {
                    h = 60 * (r - b) / (b - Math.min(g, r)) + 240;
                    s = (b - Math.min(g, r)) / b;
                    v = b;
                }
            } else {
                if (Math.max(g, b) === g) {
                    h = 60 * (b - r) / (g - Math.min(r, b)) + 120;
                    s = (g - Math.min(b, r)) / g;
                    v = g;
                } else {
                    h = 60 * (r - b) / (b - Math.min(g, r)) + 240;
                    s = (b - Math.min(g, r)) / b;
                    v = b;
                }
            }

            h = h % 360;
            return {h:h, v:v, s:s};
        }

    }

    export class Rect {

        get center(): Vector.Vector2D { return this.calcCenter(); }
        get width(): number { return this.left - this.right; }
         get height(): number { return this.bottom - this.top; }

        constructor(public left: number, public top: number,
                    public right: number, public bottom: number) {
            this.center = this.calcCenter();
        }

        private calcCenter(): Vector.Vector2D {
            var width = this.right - this.left,
            height = this.bottom - this.top;
            return new Vector.Vector2D(this.left + width / 2,
                                       this.top + height / 2);
        }

        set (left: number, top: number, right: number, bottom: number) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
    }

    export module Vector {

        // 二次元ベクトルを返す。基本的にチェーンメソッドで繋げられるようになっている。
        export class Vector2D {
            constructor(public x: number, public y: number) { }

            // このオブジェクトをnormalizeしたものを返す。
            normalize(): Vector2D {
                var norm = this.norm();
                this.x /= norm;
                this.y /= norm;
                return this;
            }

            norm(): number {
                return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
            }

            dot(v: Vector2D): number {
                if (v == null) {
                    return 0;
                }

                return this.x * v.x + this.y * v.y;
            }

            // 自身に渡されたベクトルを加算した新しいベクトルを返す
            add(v: Vector2D): Vector2D {
                return new Vector2D(this.x + v.x, this.y + v.y);
            }

            // 自身に渡されたベクトルを減算した新しいベクトルを返す
            sub(v: Vector2D): Vector2D {
                return new Vector2D(this.x - v.x, this.y - v.y);
            }

            // 自身をscaleしたVectorを返す
            scale(s: number): Vector2D {
                this.x *= s;
                this.y *= s;
                return this;
            }

            // 自身を逆向きにして、自身を返す。
            invert(): Vector2D {
                this.x *= -1;
                this.y *= -1;
                return this;
            }
        }
    }
}

// レンダリング可能なオブジェクトが実装するインターフェース
export interface Renderable {
    render(context: Context): void;
}

// Renderableインターフェースを実装した、何も行わないクラス
export class NullRenderable implements Renderable {
    render(context: Context) {}
}

// 描画可能なオブジェクトのインターフェース
export interface Symbolize extends Renderable {
    // 図形における基準となる2D座標。
    // この座標はすべての図形において、図形全体を包む矩形の左上座標を表す
    x: number;
    y: number;
    width: number;
    height: number;

    // 表示するかどうかを表す
    visible: bool;

    // レンダリングを行う順序を指定する。0が最も奥で、値が増えるほど前になる。
    zIndex: number;

    // 指定されたx/y軸方向への距離分移動する
    moveBy(x: number, y: number): void;
    // 指定されたx/y座標に移動する
    moveTo(x: number, y: number): void;
}

// 描画可能なオブジェクトの基底クラス
export class Symbol implements Symbolize {
    // それぞれの値について、初期値を設定する責任は、このクラスを継承した先のクラスにある

    constructor(public x = 0, public y = 0,
                public width = 0, public height = 0,
                public visible = true, public zIndex = 0) {
    }

    // このクラスのレンダリングは何も行わない
    render(context: Context): void { }

    moveBy(x: number, y: number) {
        this.x += x;
        this.y += y;
    }

    moveTo(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

// Animaのインターフェース。
export interface Anima {

    // symbolをAnimaに登録する。登録されたsymbolに対して、一つのTimelineが
    // 割り付けられて登録される。
    // 返却されたTimelineは、同時にAnimaに登録されるため、Timelineから設定された
    // アニメーションは、自動的にAnimaの処理時に進められる。
    add(symbol: Symbolize): tl.Timeline;

    // 登録されているsymbolに割り当てられているtimelineを取得する。
    getTimeline(symbol: Symbolize): tl.Timeline;

    // Symbolを削除する。Timelineも同時に削除するため、削除後は何も行われない。
    remove(symbol: Symbolize): void;

    // フレームを一つ進める。
    tickFrame() : void;
}

class AnimaImpl implements Anima {

    // 登録されたsymbolと、割り付けられたtimelineを保存する。
    // ここに保存されたtimelineは、tickが呼び出されるたびに、Timeline.tickが
    // 呼び出されるようになる。
    private _timelines: { symbol: Symbolize; timeline: tl.Timeline; }[] = [];

    constructor() { }

    // symbolを処理対象として登録し、アニメーション操作用のTimelineを返却する。
    add(symbol: Symbolize): tl.Timeline {
        var result =tl.TimelineFactory.create(symbol);
        this._timelines.push({symbol : symbol,
                              timeline: result});
        return result;
    }

    // 渡されたsymbolに等しいsymbolに関連付けられたtimelineを返す。
    getTimeline(symbol: Symbolize): tl.Timeline {
        var equals = this._timelines.filter((elem) => {
            return elem.symbol === symbol
        });

        if (equals.length > 0) {
            return equals[0].timeline;
        }
        return null;
    }

    // 渡されたsymbolを削除する。
    remove(symbol: Symbolize): void  {
        util.removeWith(this._timelines, (obj : {symbol:Symbolize;}) => {
            return obj.symbol === symbol});
    }

    tickFrame() : void {
        this._timelines.forEach((elem) => {
            elem.timeline.tick();
        });
    }
}

// レンダリングターゲットに対して、各種のアニメーションを管理するための
// singletonオブジェクト
// アニメーションや、時間ベースでの処理を実行したいオブジェクトは、Animaから生成されるTimelineオブジェクト
// を取得し、各フレームごとにAnimaの更新処理を行うことで、全体のアニメーションを、時間ベースで
// 一極管理することができる。
export var Anima : Anima = new AnimaImpl();

// 描画オブジェクトの描画先となるコンテキストクラス
export class Context {

    // レンダリング先のコンテキスト
    private _context: CanvasRenderingContext2D;
    private _width: number = 0;
    private _height: number = 0;

    get context(): CanvasRenderingContext2D { return this._context; }
    get width(): number { return this._width; }
    get height(): number { return this._height; }

    contextEnabled(): bool { return this._context != null; }

    constructor(canvas: HTMLCanvasElement) {
        if (canvas) {
            this._context = canvas.getContext("2d");
            this._width = canvas.width;
            this._height = canvas.height;
        } else {
            this._context = null;
        }
    }

    clear(): void {
        this._context.clearRect(0, 0, this._width, this._height);
    }
}

export class InvalidCanvasException {

    constructor(public message: string) {

    }
}

// Canvas.fillStyleに対する設定を行うためのクラス群
// CanvasGradientをラッピングしたクラスなどを提供する
export module Gradation {

    // グラディエーションクラスのインターフェース
    export interface Gradient {
        clear(): void;
        colorStop(offset: number, color: string): Gradient;
        raw(): CanvasGradient;
    }

    // 何の処理も行わないGradient
    export class NullGradient implements Gradient {
        constructor() { }
        clear(): void { }
        colorStop(offset: number, color: string): Gradient {
            return this;
        }

        raw(): CanvasGradient {
            return null;
        }
    }

    // 線形グラディエーションクラス
    export class Linear implements Gradient {
        private _linearGradient: CanvasGradient;
        private _context: Context;
        private _fromX: number;
        private _fromY: number;
        private _toX: number;
        private _toY: number;

        constructor(context: Context) {
            if (context.contextEnabled) {
                this._context = context;
            }
        }

        clear(): void {
            this._fromX = 0;
            this._fromY = 0;
            this._toX = 0;
            this._toY = 0;
        }

        from(x: number, y: number): Linear {
            this._fromX = x;
            this._fromY = y;
            return this;
        }

        to(x: number, y: number): Linear {
            this._toX = x;
            this._toY = y;
            return this;
        }

        colorStop(offset: number, color: string): Linear {
            if (this._context == null) {
                throw new InvalidCanvasException("Invalid canvas");
            }

            if (this._linearGradient == null) {
                this._linearGradient = this._context.context.createLinearGradient(this._fromX, this._fromY,
                                                                                  this._toX, this._toY);
            }

            this._linearGradient.addColorStop(offset, color);
            return this;
        }

        raw(): CanvasGradient { return this._linearGradient; }

    }

    // 円形グラディエーションクラス
    export class Radial {
        private _radialGradient: CanvasGradient;
        private _context: Context;
        private _fromX: number;
        private _fromY: number;
        private _fromR: number;
        private _toX: number;
        private _toY: number;
        private _toR: number;

        constructor(context: Context) {
            if (context.contextEnabled) {
                this._context = context;
            }
        }

        clear(): void {
            this._fromX = 0;
            this._fromY = 0;
            this._fromR = 0;
            this._toX = 0;
            this._toY = 0;
            this._toR = 0;
        }

        from(x: number, y: number, r: number): Radial {
            this._fromX = x;
            this._fromY = y;
            this._fromR = r;
            return this;
        }

        to(x: number, y: number, r: number): Radial {
            this._toX = x;
            this._toY = y;
            this._toR = r;
            return this;
        }

        colorStop(offset: number, color: string): Radial {
            if (this._context == null) {
                throw new InvalidCanvasException("Invalid canvas");
            }

            if (this._radialGradient == null) {
                this._radialGradient = this._context.context.createRadialGradient(this._fromX, this._fromY,
                                                                                  this._fromR, this._toX, this._toY, this._toR);
            }

            this._radialGradient.addColorStop(offset, color);
            return this;
        }

        raw(): CanvasGradient { return this._radialGradient; }
    }
}

module Util {

    // save〜restoreをラップしたクラスを提供する
    export class ContextWrapper {
        constructor(context: Context, callback: (context: Context) => any) {
            if (callback != null && context != null) {
                context.context.save();
                callback(context);
                context.context.restore();
            }
        }
    }
}

// Canvasのコンテキストをベースにした各種図形の描画機能を提供する
// ここで提供するのはあくまで描画機能のみであり、その他については提供しない
export module Renderer {

    export class BaseData {
        gradient: Gradation.Gradient = new Gradation.NullGradient();
        color: Common.Color = new Common.Color();
        x: number = 0;
        y: number = 0;
        zIndex: number = 0;
        width: number = 0;
        height: number = 0;

        constructor() { }
    }

    // 円をレンダリングする機能を提供する。
    export module Circle {

        // 円をレンダリングする際のデータ
        export class Data extends BaseData {
            constructor(public x: number, public y: number, public radius: number) {
                super();
                this.height = radius * 2;
                this.width = radius * 2;
            }
        }

        // 所持するデータをもとに、contextに円をレンダリングするクラス
        export class CircleRenderer implements Renderable {
            constructor(public data: Data) { }

            render(context: Context): void {

                var ctx = context.context;
                var dat = this.data;

                // グラディエーションが設定可能である場合は設定する
                // 設定可能ではない場合は、baseColorを改めて設定する
                if (dat.gradient) {
                    ctx.fillStyle = dat.gradient.raw();
                } else {
                    ctx.fillStyle = dat.color.toFillStyle();
                }

                ctx.beginPath();
                ctx.arc(dat.x + dat.radius, dat.y + dat.radius,
                        dat.radius, 0, Math.PI * 2, true);

                ctx.fill();
            }
        }
    }

    export module Box {

        // 矩形をレンダリングする際のデータ
        export class Data extends BaseData {
            constructor(public x: number, public y: number,
                        public width: number, public height: number) {
                super();
            }
        }
        // 矩形
        export class BoxRenderer implements Renderable {

            isFill: bool = true;

            constructor(public data: Data) { }

            render(context: Context): void {
                new Util.ContextWrapper(context, (context) => {

                    var ctx = context.context;
                    // グラディエーションが設定可能である場合は設定する
                    if (!(this.data.gradient instanceof Gradation.NullGradient)) {
                        ctx.fillStyle = this.data.gradient.raw();
                    } else {
                        ctx.fillStyle = this.data.color.toFillStyle();
                    }

                    if (this.isFill) {
                        ctx.fillRect(this.data.x, this.data.y, this.data.width, this.data.height);
                    } else {
                        ctx.rect(this.data.x, this.data.y, this.data.width, this.data.height);
                    }
                });
            }
        }
    }
}

