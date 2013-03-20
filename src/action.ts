// Timeline��ōs����e��A�N�V������ۑ����邽�߂̋@�\��񋟂���B

// ��̃A�N�V�����ɂ��Ă̏���ێ�����N���X�B
export class Action {
    // �A�N�V�����̏��v�t���[�����AAction���J�n�����ۂɌĂяo�����n���h���A
    // �A�N�V�������s���̊e�t���[���ŌĂяo�����n���h���A������Action�I�����Ɏ��s�����
    // �n���h���ō\�������B
    constructor(public frame: number,
        public onactionstart: () => void ,
        public onactiontick: () => void ,
        public onactionend: () => void ) { }
}

// �A�N�V���������̂��߂̃w���p�֐��B�K�v�ȕ��������ݒ肷�邱�Ƃ��ł���B
export function generate(frame = 0,
    onactionstart = () => { },
    onactiontick = () => { },
    onactionend = () => { }): Action {

    var aFrame = 0;
    var start = () => { };
    var end = () => { };
    var tick = () => { };

    if (frame !== null) {
        aFrame = frame;
    }

    if (onactionstart !== null) {
        start = onactionstart;
    }

    if (onactiontick !== null) {
        tick = onactiontick;
    }

    if (onactionend !== null) {
        end = onactionend;
    }

    return new Action(aFrame, start, tick, end);
}
