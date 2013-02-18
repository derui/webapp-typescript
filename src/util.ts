
function isNum(x:Object) : bool {
    return x != null && x instanceof Number;
}

export class String {

    // zero padding.
    static zeroPadding(num:number, size:number) : string {
        var numStr = num.toString();
        if (numStr.length >= size) {
            return numStr;
        } else if (size <= 0) {
            return numStr;
        } else {
            for (var i = 0;i < size - numStr.length;i++) {
                numStr = "0" + numStr;
            }
            return numStr;
        }
    };

}
