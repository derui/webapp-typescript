
import util = module('util');

// レンダリング可能なオブジェクトが実装するインターフェース
interface Renderable  {
    render(context:Context) : void;
}

// 描画可能なオブジェクトのインターフェース。
export interface Entity extends Renderable {
    // 図形における基準となる2D座標。
    // この座標はすべての図形において、図形全体を包む矩形の左上座標を表す
    x : number;
    y : number;
    width: number;
    height: number;

    // レンダリングを行う順序を指定する。0が最も奥で、値が増えるほど前になる。
    zIndex: number = 0;
}

// 描画可能なオブジェクトの基底クラス
export class EntityBase implements Entity {
    x:number = 0;
    y:number = 0;
    width:number = 0;
    height:number = 0;
    zIndex:number = 0;

    // このクラスのレンダリングは何も行わない
    render(context:Context) : void {}
}

export class RenderingEngine {
    private _shapeList:Shapes.Renderable[]

    constructor(id:String) {
        var element = <HTMLCanvasElement>document.getElementById(id);
        if (element != null) {
            this._context = new Context(element);
        }
        this._shapeList = [];
    }

    addEntity(entity:Entity) : void {
        if (entity != null) {
            this._shapeList.push(entity);
        }
    }

    renderEntities() : void {
        context.clear();
        for (var entity : this._shapeList) {
            entity.render(this._context);
        }
    }
}

// レンダリングターゲットに対して、各種のアニメーションを管理するための
// singletonなクラス
export class Anima {

    static private _instance:Anima = null;

    private constructor() {}

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
    private _context:CanvasRenderingContext2D;

    public get context() : CanvasRenderingContext2D { return this._context;}

    contextEnabled() : bool {return this._context != null;}

    constructor(canvas:HTMLCanvasElement) {
        if (canvas) {
            this._context = canvas.getContext("2d");
        } else {
            this._context = null;
        }
    }

    clear() : void {
        var width = this._context.width,
        height = this._context.heigit;
        this._context.clearRect(0, 0, width, height);
    }
}

// Canvasのコンテキストをベースにした各種図形の描画機能を提供する
export module Shapes {

    // 円
    export class Circle extends EntityBase {

        constructor(public radius:number) {
            this.width = radius * 2;
            this.height = radius * 2;
        }

        render(context:Context) : void {
            var ctx = context.context;
            ctx.beginPath();
            ctx.arcTo(this.x +  this.radius, this.y + this.radius,
                      this.x + this.radius, this.y, Math.PI * 2, false);
            ctx.closePath();
        }
    }
}
