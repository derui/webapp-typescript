
export class String {

    // zero padding.
    static zeroPadding(num:number, size:number) : string {
        var numStr = Number.toString(num);
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

// Utitilies for number type.
export class Number {

    // Stringify number.
    static toString(num:number) : string {
        return num + "";
    }
}