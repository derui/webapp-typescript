define(["require", "exports"], function(require, exports) {
    /// <reference path='../lib/jquery.d.ts' />
    // デバイスに関係する情報を提供するモジュール。
        var portraitWidth, landscapeWidth, portraitHeight, landscapeHeight;
    var baseWidth, baseHeight;
    var zoomRatio = 1.0;
    // アンドロイドかどうかを調べる。
    function isAndroid() {
        return /Android/.test(window.navigator.userAgent);
    }
    exports.isAndroid = isAndroid;
    // デバイスの情報を初期化する。初期化した時点で、ウィンドウの情報などが取得できる
    // 状態でなければならない。
    function initDevice(width, height) {
        portraitWidth = $(window).width();
        zoomRatio = portraitWidth / width;
        $(window).bind("resize", function () {
            if(Math.abs(window.orientation) === 0) {
                if(/Android/.test(window.navigator.userAgent)) {
                    if(!portraitWidth) {
                        portraitWidth = $(window).width();
                    }
                    if(!portraitHeight) {
                        portraitHeight = $(window).height();
                    }
                } else {
                    portraitWidth = $(window).width();
                    portraitHeight = $(window).height();
                }
                var zoomWidth = portraitWidth / width;
                var zoomHeight = portraitHeight / height;
                zoomRatio = zoomWidth < zoomHeight ? zoomWidth : zoomHeight;
                $("html").css("zoom", zoomRatio);
            } else {
                if(/Android/.test(window.navigator.userAgent)) {
                    if(!landscapeWidth) {
                        landscapeWidth = $(window).width();
                    }
                    if(!landscapeHeight) {
                        landscapeHeight = $(window).height();
                    }
                } else {
                    landscapeWidth = $(window).width();
                    landscapeHeight = $(window).height();
                }
                var zoomWidth = landscapeWidth / width;
                var zoomHeight = landscapeHeight / height;
                zoomRatio = zoomWidth < zoomHeight ? zoomWidth : zoomHeight;
                $("html").css("zoom", zoomRatio);
            }
        }).trigger("resize");
    }
    exports.initDevice = initDevice;
    // 拡大の基準となるサイズを設定する。
    function getBaseSize() {
        return {
            width: baseWidth,
            height: baseHeight
        };
    }
    exports.getBaseSize = getBaseSize;
    // 拡大率を返す。
    function getZoomRatio() {
        return zoomRatio;
    }
    exports.getZoomRatio = getZoomRatio;
    // 指定された拡大前の位置について、拡大後の位置を返す。
    function getZoomedPoint(x, y) {
        return {
            x: x * zoomRatio,
            y: y * zoomRatio
        };
    }
    exports.getZoomedPoint = getZoomedPoint;
    // 拡大された状態での位置について、拡大前の位置を返す。
    function getOriginPoint(x, y) {
        console.log(zoomRatio);
        return {
            x: Math.floor(x * 1.0 / zoomRatio),
            y: Math.floor(y * 1.0 / zoomRatio)
        };
    }
    exports.getOriginPoint = getOriginPoint;
})
