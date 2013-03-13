
import act = module("action");
import anim = module("animation");

/*
 * 時間ベースでのアニメーションを行うオブジェクトのインターフェース。
 * 基本的にはメソッドチェインで行われるようにする。
 * それぞれのメソッドは、Actionを生成し、呼び出された順にActionをキューに追加していく。
 各アクションは、frameの単位で処理が行われ、同一フレームで次のアクションが呼び出されることはない。
*/
export interface Timeline {

    // 指定したフレームだけかけて、x/yだけ移動する
    moveBy(x: number, y: number, frame: number): Timeline;
    // 指定したフレームかけて、x/yに移動する
    moveTo(x: number, y: number, frame: number): Timeline;

    // 指定したフレームかけて、s倍にスケールする
    scale(s: number, frame: number): Timeline;

    // 指定したフレームだけdelayした後、次のアクションを実行するアクションを追加する
    delay(frame:number) : Timeline;

    // 指定した関数を実行した後、すぐに次のアクションを実行するアクションを追加する。
    then(action:() => void) : Timeline;

    // 指定した関数を、指定したフレームの間繰り返し実行するアクションを追加する。
    repeat(frame: number, action:() => void) : Timeline;

    // loopをよびだした時点より前に登録されたアクションについて、それらが終了した時点で、
    // 再度キューに登録されるようにする。loopを呼び出した後は、unloopを呼び出さない限り、
    // 他のアクションをタイムラインに登録することができない。
    loop(): void;

    // loopアクションを取り除く。呼び出した時点で、loopアクション内のアクションが
    // 実行中である場合、それらは実行される。
    unloop(): Timeline;

    // 指定した内容のactionをtimelineに追加する。
    add(frame:number, onactionstart:() => void, onactiontick: () => void,
        onactionend: () => void ): Timeline;

    // 1フレーム毎に呼び出される処理。
    tick(): void;
}

// アクションの実行状況。
enum ActionStatus {
    YET_START,    // 開始前
    STARTED       // 開始後
};

// Timelineを作成して返す。Implは直接アクセスすることはできない。
export var TimelineFactory : {create(symbol : anim.Symbolize) : Timeline;} = {
    create : (symbol) => {return new TimelineImpl(symbol)}
};

class TimelineImpl implements Timeline {

    // タイムライン上にのせるアクションを定義する。FIFO形式で利用される。
    private _actionQueue: act.Action[] = [];
    private _actionStatus: ActionStatus = ActionStatus.YET_START;

    private _nowLoop : bool  = false;
    private _currentActionFrame : number = 0;

    // コンストラクタでは、アニメーション対象となるsymbolを設定する。
    constructor(public symbol: anim.Symbolize) { }

    moveBy(x: number, y: number, frame: number): Timeline {
        var perX = x / frame, perY = y / frame;
        this.add(frame, null,
                 () => { this.symbol.moveBy(perX, perY); },
                 null);
        return this;
    }

    moveTo(x: number, y: number, frame: number): Timeline {
        var diffX = x - this.symbol.x, diffY = y - this.symbol.y;
        var perX = diffX / frame, perY = diffY / frame;
        this.add(frame, null,
                 () => {
                     this.symbol.moveBy(perX, perY);
                 }, null);
        return this;
    }

    scale(s: number, frame: number): Timeline {
        var perWidth = this.symbol.width * s - this.symbol.width / frame,
        perHeight = this.symbol.height * s - this.symbol.height / frame;
        this.add(frame, null,
                 () => {
                     this.symbol.width += perWidth;
                     this.symbol.height += perHeight;
                 }, null);
        return this;
    }

    delay(frame:number) : Timeline {
        this.add(frame, () => {}, () => {}, () => {});
        return this;
    }

    then(action:() => void) : Timeline {

        this.add(1, () => {}, action, () => {});
        return this;
    }

    repeat(frame:number, action:() => void) : Timeline {
        this.add(frame, () => {}, action, () => {});
        return this;
    }


    // ループを開始する。
    loop(): void {
        this._nowLoop = true;
    }

    unloop(): Timeline {
        this._nowLoop = false;
        return this;
    }

    // アクションを追加する
    add(frame: number, onactionstart: () => void , onactiontick: () => void,
        onactionend: () => void ): Timeline
    {
        // ループの間の場合、追加は行わせない。
        if (!this._nowLoop) {
            this._actionQueue.push(
                new act.Action(frame, onactionstart, onactiontick, onactionend));
        }

        return this;
    }

    // フレームごとの処理を行う。
    tick(): void {
        if (this._actionStatus === ActionStatus.YET_START) {
            if (this._actionQueue.length > 0) {
                this._actionQueue[0].onactionstart();
                this._actionStatus = ActionStatus.STARTED;
                this._currentActionFrame = this._actionQueue[0].frame;
            }
        }

        // アクションが存在する場合にはtickを呼び出す。
        // frameが0になった時点で、onactionendを呼び出し、キューから取り出す。
        if (this._actionQueue.length > 0) {
            if (this._currentActionFrame > 0) {
                this._actionQueue[0].onactiontick();

                this._currentActionFrame--;
            } else {
                var action = this._actionQueue.shift();
                action.onactionend();

                // ループが実行中である場合、終了したアクションを末尾に追加して、繰り返しが行えるようにする。
                if (this._nowLoop) {
                    this._actionQueue.push(action);
                }
                this._actionStatus = ActionStatus.YET_START;
            }
        }
    }
}
