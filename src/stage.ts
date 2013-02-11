
export class Stage {

    // このStageが利用するcanvas
    private canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    private _width:number;
    private _height:number;

    public get width() : number {
        return this._width;
    }

    public get height() : number {
        return this._height;
    }

    constructor(canvasId : string) {
        this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);

        this._width = this.canvas.width;
        this._height = this.canvas.height;
    }
}
