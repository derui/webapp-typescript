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
})
