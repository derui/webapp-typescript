
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

// �^�ɓڒ����Ȃ��悤�ȏ�����񋟂��郂�W���[���B
// TODO: �W�F�l���N�X���g����悤�ɂȂ������_�ŁA���̕����̏����ɂ��ĕ��U�ł���ꏊ�͕��U����
export module Illiegals {

    export interface PropertyMapping {
        // �o�C���h����v���p�e�B�B�����łȂ���΂Ȃ�Ȃ��B
        name: string;

        // Getter�𐶐����Ȃ����ǂ����Btrue�ȊO�̏ꍇ�͐�������
        noGetterBind: bool;
        // Setter�𐶐����Ȃ����ǂ����Btrue�ȊO�̏ꍇ�͐�������
        noSetterBind: bool;
    }

    export function binder(name: string, noGetterBind = false, noSetterBind = false): PropertyMapping {
        return { name: name, noGetterBind: noGetterBind, noSetterBind: noSetterBind }
    }

    // JavaScript���̋@�\�𗘗p���āA�N���X�ɓ��I��setter��getter�𐶐�����B
    // Mixin���o������s�v�ɂȂ�\��������B
    // getter/setter���쐬���鑤�ɓ����̃v���p�e�B�����݂���K�v�͖����B
    // @param src any setter/getter�𐶐�����I�u�W�F�N�g
    // @param dst any setter/getter����l���擾/�ݒ肷��I�u�W�F�N�g
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