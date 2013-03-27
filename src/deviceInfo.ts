/// <reference path='../lib/jquery.d.ts' />

// デバイスに関係する情報を提供するモジュール。

var portraitWidth : number, landscapeWidth :number,
portraitHeight : number, landscapeHeight : number;

var baseWidth :number, baseHeight :number;

var zoomRatio : number = 1.0;

// アンドロイドかどうかを調べる。
export function isAndroid() : bool {
    return /Android/.test(window.navigator.userAgent);
}

declare var window : any;
// デバイスの情報を初期化する。初期化した時点で、ウィンドウの情報などが取得できる
// 状態でなければならない。
export function initDevice(width:number, height:number) : void {

    portraitWidth = $(window).width();
    zoomRatio = portraitWidth/width
    $(window).bind("resize", () => {
        if(Math.abs(window.orientation) === 0){
            if(/Android/.test(window.navigator.userAgent)){
                if(!portraitWidth)portraitWidth=$(window).width();
                if(!portraitHeight) portraitHeight=$(window).height();
            }else{
                portraitWidth=$(window).width();
                portraitHeight = $(window).height();
            }

            var zoomWidth = portraitWidth / width;
            var zoomHeight = portraitHeight / height;
            zoomRatio = zoomWidth < zoomHeight ? zoomWidth : zoomHeight;

            $("html").css("zoom" , zoomRatio);
        }else{
            if(/Android/.test(window.navigator.userAgent)){
                if(!landscapeWidth)landscapeWidth=$(window).width();
                if(!landscapeHeight)landscapeHeight=$(window).height();
            }else{
                landscapeWidth=$(window).width();
                landscapeHeight=$(window).height();
            }

            var zoomWidth = landscapeWidth / width;
            var zoomHeight = landscapeHeight / height;
            zoomRatio = zoomWidth < zoomHeight ? zoomWidth : zoomHeight;

            $("html").css("zoom" , zoomRatio);
        }
    }).trigger("resize");
}

// 拡大の基準となるサイズを設定する。
export function getBaseSize() : {width:number;height:number;} {
    return {width : baseWidth, height: baseHeight};
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
