function isNum(x) {
    return x != null && x instanceof Number;
}
function remove(x, o) {
    var len = x.length;
    for(var i = len; i >= 0; --i) {
        if(x[i] === o) {
            x.splice(i, 1);
        }
    }
}
exports.remove = remove;
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
// 標準の連想配列とは違う、型安全な連想配列（ジェネリクス必要）
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
var PropertyMappingImpl = (function () {
    function PropertyMappingImpl(name, noGetterBind, noSetterBind) {
        this.name = name;
        this.noGetterBind = noGetterBind;
        this.noSetterBind = noSetterBind;
    }
    return PropertyMappingImpl;
})();
function binder(name, noGetterBind, noSetterBind) {
    if (typeof noGetterBind === "undefined") { noGetterBind = false; }
    if (typeof noSetterBind === "undefined") { noSetterBind = false; }
    return {
        name: name,
        noGetterBind: noGetterBind,
        noSetterBind: noSetterBind
    };
}
exports.binder = binder;
// JavaScript側の機能を利用して、クラスに動的にsetterとgetterを生成する。
// Mixinが出来たら不要になる可能性がある。
// @param src any setter/getterを生成するオブジェクト
// @param dst any setter/getterから値を取得/設定するオブジェクト
function propBind(mappings, src, dst) {
    if(mappings === null) {
        return;
    }
    mappings.forEach(function (mapping) {
        if(src[mapping.name] && dst[mapping.name]) {
            if(mapping.noGetterBind) {
                src[mapping.name] = function () {
                    return dst[mapping.name];
                };
            }
            if(mapping.noSetterBind) {
                src[mapping.name] = function (e) {
                    dst[mapping.name] = e;
                };
            }
        }
    });
}
exports.propBind = propBind;
//@ sourceMappingURL=util.js.map
