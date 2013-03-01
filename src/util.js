define(["require", "exports"], function(require, exports) {
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
    // Œ^‚É“Ú’…‚µ‚È‚¢‚æ‚¤‚Èˆ—‚ð’ñ‹Ÿ‚·‚éƒ‚ƒWƒ…[ƒ‹B
    // TODO: ƒWƒFƒlƒŠƒNƒX‚ªŽg‚¦‚é‚æ‚¤‚É‚È‚Á‚½Žž“_‚ÅA‚±‚Ì•”•ª‚Ìˆ—‚É‚Â‚¢‚Ä•ªŽU‚Å‚«‚éêŠ‚Í•ªŽU‚·‚é
    (function (Illiegals) {
        function binder(name, noGetterBind, noSetterBind) {
            if (typeof noGetterBind === "undefined") { noGetterBind = false; }
            if (typeof noSetterBind === "undefined") { noSetterBind = false; }
            return {
                name: name,
                noGetterBind: noGetterBind,
                noSetterBind: noSetterBind
            };
        }
        Illiegals.binder = binder;
        // JavaScript‘¤‚Ì‹@”\‚ð—˜—p‚µ‚ÄAƒNƒ‰ƒX‚É“®“I‚Ésetter‚Ægetter‚ð¶¬‚·‚éB
        // Mixin‚ªo—ˆ‚½‚ç•s—v‚É‚È‚é‰Â”\«‚ª‚ ‚éB
        // @param src any setter/getter‚ð¶¬‚·‚éƒIƒuƒWƒFƒNƒg
        // @param dst any setter/getter‚©‚ç’l‚ðŽæ“¾/Ý’è‚·‚éƒIƒuƒWƒFƒNƒg
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
        Illiegals.propBind = propBind;
    })(exports.Illiegals || (exports.Illiegals = {}));
    var Illiegals = exports.Illiegals;
})
//@ sourceMappingURL=util.js.map
