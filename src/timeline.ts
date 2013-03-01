
import act = module("action");

/*
 * 時間ベースでのアニメーションを行うオブジェクトのインターフェース。
 * 基本的にはメソッドチェインで行われるようにする。
 * それぞれのメソッドは、最終的にActionを生成する。
 */
export interface Timeline {

    // 指定したフレームだけかけて、x/yだけ移動する
    moveBy(x: number, y: number, frame: number): Timeline;
    // 指定したフレームかけて、x/yに移動する
    moveTo(x: number, y: number, frame: number): Timeline;

    // 指定したフレームかけて、s倍にスケールする
    scale(s: number, frame: number): Timeline;

    // 指定した内容のactionをtimelineに追加する。
    add(frame:number, onactionstart:() => void, onactiontick: () => void,
        onactionend:() => void) : Timeline;
}

export class TimelineImpl implements Timeline {

    // タイムライン上にのせるアクションを定義する。
    private _actionQueue : act.Action[] = [];

    moveBy(x: number, y:number, frame:number) : Timeline {
        return this;
    }

}

module Actions {
}