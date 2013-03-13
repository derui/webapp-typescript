
function isNum(x:Object) : bool {
    return x != null && x instanceof Number;
}

export function remove(x:any[], o:any) : void {
    var len = x.length;
    for (var i = len - 1; i >= 0; --i) {
        if (x[i] === o) {
            x.splice(i, 1);
        }
    }
}

export function removeWith(x:any[], f:(any) => bool) : void {
    var len = x.length;
    for (var i = len - 1; i >= 0; --i) {
        if (f(x[i])) {
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

// 標準の連想配列とは違う、型安全な連想配列（ジェネリクス必要）
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

// 型に頓着しないような処理を提供するモジュール。
// TODO: ジェネリクスが使えるようになった時点で、この部分の処理について分散できる場所は分散する
export module Illiegals {

    export interface PropertyMapping {
        // バインドするプロパティ。同名でなければならない。
        name: string;

        // Getterを生成しないかどうか。true以外の場合は生成する
        noGetterBind: bool;
        // Setterを生成しないかどうか。true以外の場合は生成する
        noSetterBind: bool;
    }

    export function binder(name: string, noGetterBind = false, noSetterBind = false): PropertyMapping {
        return { name: name, noGetterBind: noGetterBind, noSetterBind: noSetterBind }
    }

    // JavaScript側の機能を利用して、クラスに動的にsetterとgetterを生成する。
    // Mixinが出来たら不要になる可能性がある。
    // getter/setterを作成する側に同名のプロパティが存在する必要は無い。
    // @param src any setter/getterを生成するオブジェクト
    // @param dst any setter/getterから値を取得/設定するオブジェクト
    export function propBind(mappings: PropertyMapping[], src: any, dst: any): void {
        if (mappings === null) {
            return;
        }

        mappings.forEach((mapping) => {
            if (dst[mapping.name] !== undefined) {

                if (!mapping.noGetterBind) {
                    Object.defineProperty(
                        src, mapping.name,
                        { get: () => { return dst[mapping.name]; }}
                    );
                }

                if (!mapping.noSetterBind) {
                    Object.defineProperty(
                        src, mapping.name,
                        { set: (val) => { dst[mapping.name] = val; }}
                    );
                }
            }
        });
    }
}