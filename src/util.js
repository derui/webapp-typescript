define(["require", "exports"], function(require, exports) {
    function isNum(x) {
        return x != null && x instanceof Number;
    }
    function remove(x, o) {
        var len = x.length;
        for(var i = len - 1; i >= 0; --i) {
            if(x[i] === o) {
                x.splice(i, 1);
            }
        }
    }
    exports.remove = remove;
    function removeWith(x, f) {
        var len = x.length;
        for(var i = len - 1; i >= 0; --i) {
            if(f(x[i])) {
                x.splice(i, 1);
            }
        }
    }
    exports.removeWith = removeWith;
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
    // �W���̘A�z�z���Ƃ͈Ⴄ�A�^���S�ȘA�z�z���i�W�F�l���N�X�K�v�j
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
    // �^�ɓڒ����Ȃ��悤�ȏ������񋟂��郂�W���[���B
    // TODO: �W�F�l���N�X���g�����悤�ɂȂ������_�ŁA���̕����̏����ɂ��ĕ��U�ł����ꏊ�͕��U����
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
        // JavaScript���̋@�\�𗘗p���āA�N���X�ɓ��I��setter��getter�𐶐������B
        // Mixin���o�������s�v�ɂȂ��\���������B
        // getter/setter���쐬���鑤�ɓ����̃v���p�e�B�����݂����K�v�͖����B
        // @param src any setter/getter�𐶐������I�u�W�F�N�g
        // @param dst any setter/getter�����l���擾/�ݒ肷���I�u�W�F�N�g
        function propBind(mappings, src, dst) {
            if(mappings === null) {
                return;
            }
            mappings.forEach(function (mapping) {
                if(dst[mapping.name] !== undefined) {
                    if(!mapping.noGetterBind) {
                        Object.defineProperty(src, mapping.name, {
                            get: function () {
                                return dst[mapping.name];
                            }
                        });
                    }
                    if(!mapping.noSetterBind) {
                        Object.defineProperty(src, mapping.name, {
                            set: function (val) {
                                dst[mapping.name] = val;
                            }
                        });
                    }
                }
            });
        }
        Illiegals.propBind = propBind;
    })(exports.Illiegals || (exports.Illiegals = {}));
    var Illiegals = exports.Illiegals;
})
