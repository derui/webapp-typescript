
function isNum(x:Object) : bool {
    return x != null && x instanceof Number;
}

export function remove(x:any[], o:any) : void {
    var len = x.length;
    for (var i = len; i >= 0; --i) {
        if (x[i] === o) {
            x.splice(i, 1);
        }
    }
}

export class String {

    // zero padding.
    static zeroPadding(num: number, size: number): string {
        var numStr = num.toString();
        if (numStr.length >= size) {
            return numStr;
        } else if (size <= 0) {
            return numStr;
        } else {
            for (var i = 0; i < size - numStr.length; i++) {
                numStr = "0" + numStr;
            }
            return numStr;
        }
    };

}

// �W���̘A�z�z��Ƃ͈Ⴄ�A�^���S�ȘA�z�z��i�W�F�l���N�X�K�v�j
export class Map {
    private _entries: {};

    constructor() { }

    add(key: any, value: any): void {
        this._entries[key] = value;
    }

    remove(key: any): void {
        delete this._entries[key];
    }

    count(): number {
        var count = 0;
        for (var k in this._entries) {
            count++;
        }
        return count;
    }

    find(key: any): any {
        if (this._entries[key]) {
            return this._entries[key];
        } else {
            return null;
        }
    }
}