// Timeline上で行われる各種アクションを保存するための機構を提供する。

// 一つのアクションについての情報を保持するクラス。
export class Action {
    // アクションの所要フレーム数、Actionが開始される際に呼び出されるハンドラ、
    // アクション実行中の各フレームで呼び出されるハンドラ、そしてAction終了時に実行される
    // ハンドラで構成される。
    constructor(public frame: number,
        public onactionstart: () => void ,
        public onactiontick: () => void ,
        public onactionend: () => void ) { }
}

// アクション生成のためのヘルパ関数。必要な部分だけ設定することができる。
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
