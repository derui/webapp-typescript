define(["require", "exports"], function(require, exports) {
    var Stage = (function () {
        function Stage(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this._width = this.canvas.width;
            this._height = this.canvas.height;
        }
        Object.defineProperty(Stage.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stage.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });
        return Stage;
    })();
    exports.Stage = Stage;    
})
