
/**
 * 時間ベースでのアニメーションを行うオブジェクトのインターフェース。
 * 基本的にはメソッドチェインで行われるようにする。
 * 基本的な処理については、TimelineImplで実装されている
 */
export interface Timeline {

    // 指定したフレームだけかけて、x/yだけ移動する
    moveBy(x: number, y: number, frame: number): Timeline;
    // 指定したフレームかけて、x/yに移動する
    moveTo(x: number, y: number, frame: number): Timeline;

    // 指定したフレームかけて、sにスケールする
    scale(s: number, frame: number): Timeline;

    // 指定した位置を中心として、指定したフレームかけて、sにスケールする
    scaleWithCenter(s: number, x: number, y: number, frame: number): Timeline;
}

class Timeline {}