define(["require", "exports"], function(require, exports) {
    // Timeline���ōs�������e���A�N�V�������ۑ����邽�߂̋@�\���񋟂����B
    // ���̃A�N�V�����ɂ��Ă̏������ێ������N���X�B
    var Action = (function () {
        // �A�N�V�����̏��v�t���[�����AAction���J�n�������ۂɌĂяo�������n���h���A
        // �A�N�V�������s���̊e�t���[���ŌĂяo�������n���h���A������Action�I�����Ɏ��s������
        // �n���h���ō\���������B
        function Action(frame, onactionstart, onactiontick, onactionend) {
            this.frame = frame;
            this.onactionstart = onactionstart;
            this.onactiontick = onactiontick;
            this.onactionend = onactionend;
        }
        return Action;
    })();
    exports.Action = Action;    
    // �A�N�V���������̂��߂̃w���p�֐��B�K�v�ȕ��������ݒ肷�邱�Ƃ��ł����B
    function generate(frame, onactionstart, onactiontick, onactionend) {
        if (typeof frame === "undefined") { frame = 0; }
        if (typeof onactionstart === "undefined") { onactionstart = function () {
        }; }
        if (typeof onactiontick === "undefined") { onactiontick = function () {
        }; }
        if (typeof onactionend === "undefined") { onactionend = function () {
        }; }
        var aFrame = 0;
        var start = function () {
        };
        var end = function () {
        };
        var tick = function () {
        };
        if(frame !== null) {
            aFrame = frame;
        }
        if(onactionstart !== null) {
            start = onactionstart;
        }
        if(onactiontick !== null) {
            tick = onactiontick;
        }
        if(onactionend !== null) {
            end = onactionend;
        }
        return new Action(aFrame, start, tick, end);
    }
    exports.generate = generate;
})
