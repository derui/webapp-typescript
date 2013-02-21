
// canvas element only.
export module Common {

    export class Color {
        constructor(public r=0, public g=0, public b=0, public a=1.0) {}

        toFillStyle() : string {
            var colors = [this.r.toString(), this.g.toString(), this.b.toString(), this.a.toString()].join(',');
            return "rgba(" + colors + ")";
        }
    }

    export class Rect {

        get center() : Vector.Vector2D {return this.calcCenter();}
        get width() : number {return this.left - this.right;}
        get height() : number {return this.bottom - this.top;}

        constructor(public left:number, public top:number,
                    public right:number, public bottom:number) {
            this.center = this.calcCenter();
        }

        private calcCenter(): Vector.Vector2D {
            var width = this.right - this.left,
            height = this.bottom - this.top;
            return new Vector.Vector2D(this.left + width / 2,
                                     this.top + height / 2);
        }

        set(left:number, top:number, right:number, bottom:number) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
    }

    export module Vector {

        // 二次元ベクトルを返す。基本的にチェーンメソッドで繋げられるようになっている。
        export class Vector2D {
            constructor(public x:number, public y:number) {}

            // このオブジェクトをnormalizeしたものを返す。
            normalize() : Vector2D {
                var norm = this.norm();
                this.x /= norm;
                this.y /= norm;
                return this;
            }

            norm() : number {
                return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
            }

            dot(v:Vector2D) :number {
                if (v == null) {
                    return 0;
                }

                return this.x * v.x + this.y * v.y;
            }

            // 自身に渡されたベクトルを加算した新しいベクトルを返す
            add(v:Vector2D) : Vector2D {
                return new Vector2D(this.x + v.x, this.y + v.y);
            }

            // 自身に渡されたベクトルを減算した新しいベクトルを返す
            sub(v:Vector2D) : Vector2D {
                return new Vector2D(this.x - v.x, this.y - v.y);
            }

            // 自身をscaleしたVectorを返す
            scale(s:number) : Vector2D {
                this.x *= s;
                this.y *= s;
                return this;
            }

            // 自身を逆向きにして、自身を返す。
            invert() : Vector2D {
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
    moveBy(x:number, y:number) : void;
    // 指定されたx/y座標に移動する
    moveTo(x:number, y:number) : void;
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

    moveBy(x:number, y:number) {
        this.x += x;
        this.y += y;
    }

    moveTo(x:number, y:number) {
        this.x = x;
        this.y = y;
    }
}

// レンダリングターゲットに対して、各種のアニメーションを管理するための
// singletonなクラス
// アニメーションを実行したいオブジェクトは、Animaから生成されるアニメーションオブジェクト
// を取得し、各フレームごとにAnimaの更新処理を行うことで、全体のアニメーションを、時間ベースで
// 一極管理することができる。
export class Anima {

    static private _instance: Anima = null;

    private static getInstance(): Anima {
        if (this._instance == null) {
            this._instance = new Anima();
        }
        return this._instance;
    }
}

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

// CanvasGradientをラッピングしたクラスを提供するモジュール
export module Gradietion {

    // グラディエーションクラスのインターフェース
    export interface Gradient {
        clear() : void;
        colorStop(offset: number, color: string): Gradient;
        raw(): CanvasGradient;
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

        clear() : void {
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

        clear() : void {
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
export module Shapes {

    // 円
    export class Circle extends Symbol {

        private _gradient: Gradietion.Gradient;
        baseColor : Common.Color = new Common.Color();

        set gradient(g: Gradietion.Gradient) { this._gradient = g; }

        constructor(public radius: number) {
            super();
            this.x = 0;
            this.y = 0;
            this.width = radius * 2;
            this.height = radius * 2;
            this.zIndex = 0;
        }

        render(context: Context): void {

            var ctx = context.context;

            // グラディエーションが設定可能である場合は設定する
            // 設定可能ではない場合は、baseColorを改めて設定する
            if (this._gradient) {
                ctx.fillStyle = this._gradient.raw();
            } else {
                ctx.fillStyle = this.baseColor.toFillStyle();
            }

            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius,
                    this.radius, 0, Math.PI * 2, true);

            ctx.fill();
        }
    }

    // 矩形
    export class Box extends Symbol {

        private _gradient: Gradietion.Gradient;
        set gradient(g: Gradietion.Gradient) { this._gradient = g; }
        isFill: bool = true;

        constructor(public width: number, public height: number) {
            super();
            this.x = 0;
            this.y = 0;
            this.zIndex = 0;
        }

        render(context: Context): void {
            new Util.ContextWrapper(context, (context) => {

                var ctx = context.context;
                // グラディエーションが設定可能である場合は設定する
                if (this._gradient) {
                    ctx.fillStyle = this._gradient.raw();
                }

                if (this.isFill) {
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                } else {
                    ctx.rect(this.x, this.y, this.width, this.height);
                }
            });
        }
    }
}
