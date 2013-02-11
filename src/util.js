define(["require", "exports"], function(require, exports) {
    var String = (function () {
        function String() { }
        String.zeroPadding = // zero padding.
        function zeroPadding(num, size) {
            var numStr = Number.toString(num);
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
    // Utitilies for number type.
    var Number = (function () {
        function Number() { }
        Number.toString = // Stringify number.
        function toString(num) {
            return num + "";
        };
        return Number;
    })();
    exports.Number = Number;    
})
