/// <reference path='../lib/jquery.d.ts' />

// デバイスに関係する情報を提供するモジュール。

var portraitWidth : number, landscapeWidth :number;

var zoomRatio : number = 1.0;

declare var window : any;
// デバイスの情報を初期化する。初期化した時点で、ウィンドウの情報などが取得できる
// 状態でなければならない。
export function initDevice() : void {

    portraitWidth = $(window).width();
    zoomRatio = portraitWidth/320;
    $(window).bind("resize", () => {
        if(Math.abs(window.orientation) === 0){
            if(/Android/.test(window.navigator.userAgent)){
                if(!portraitWidth)portraitWidth=$(window).width();
            }else{
                portraitWidth=$(window).width();
            }
            $("html").css("zoom" , portraitWidth/320 );
            zoomRatio = portraitWidth/320;
        }else{
            if(/Android/.test(window.navigator.userAgent)){
                if(!landscapeWidth)landscapeWidth=$(window).width();
            }else{
                landscapeWidth=$(window).width();
            }
            $("html").css("zoom" , landscapeWidth/320 );
            zoomRatio = portraitWidth/320;
        }
    }).trigger("resize");
}

// 拡大率を返す。
export function getZoomRatio() : number {
    return zoomRatio;
}

// 指定された拡大前の位置について、拡大後の位置を返す。
export function getZoomedPoint(x: number, y: number) : {x:number;y:number;} {
    return {x:x * zoomRatio, y:y * zoomRatio};
}

// 拡大された状態での位置について、拡大前の位置を返す。
export function getOriginPoint(x: number, y:number) : {x:number;y:number;} {
    console.log(zoomRatio);
    return {x:Math.floor(x * 1.0 / zoomRatio), y:Math.floor(y * 1.0 / zoomRatio)};
}

