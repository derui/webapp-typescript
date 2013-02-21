define(["require", "exports"], function(require, exports) {
    function isNum(x) {
        return x != null && x instanceof Number;
    }
    var String = (function () {
        function String() { }
        String.zeroPadding = // zero padding.
        function zeroPadding(num, size) {
            var numStr = num.toString();
            if(numStr.length >= size) {
                return numStr;
            } else if(size <= 0) {
                return numStr;
            } else {
                for(var i = 0; i < size - numStr.length; i++) {
                    numStr = "0" + numStr;
                }
                return numStr;
            }
        };
        return String;
    })();
    exports.String = String;    
    // •W€‚Ì˜A‘z”z—ñ‚Æ‚Íˆá‚¤AŒ^ˆÀ‘S‚È˜A‘z”z—ñiƒWƒFƒlƒŠƒNƒX•K—vj
    var Map = (function () {
        function Map() {
        }
        Map.prototype.add = function (key, value) {
            this._entries[key] = value;
        };
        Map.prototype.remove = function (key) {
            delete this._entries[key];
        };
        Map.prototype.count = function () {
            var count = 0;
            for(var k in this._entries) {
                count++;
            }
            return count;
        };
        Map.prototype.find = function (key) {
            if(this._entries[key]) {
                return this._entries[key];
            } else {
                return null;
            }
        };
        return Map;
    })();
    exports.Map = Map;    
})
//@ sourceMappingURL=util.js.map
