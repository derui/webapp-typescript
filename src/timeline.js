define(["require", "exports", "action"], function(require, exports, __act__) {
    var act = __act__;

    
    // アクションの実行状況。
    var ActionStatus;
    (function (ActionStatus) {
        ActionStatus._map = [];
        ActionStatus._map[0] = "YET_START";
        ActionStatus.YET_START = 0;// 開始前
        
        ActionStatus._map[1] = "STARTED";
        ActionStatus.STARTED = 1;// 開始後
        
    })(ActionStatus || (ActionStatus = {}));
    ;
    // Timelineを作成して返す。Implは直接アクセスすることはできない。
    exports.TimelineFactory = {
        create: function (symbol) {
            return new TimelineImpl(symbol);
        }
    };
    var TimelineImpl = (function () {
        // コンストラクタでは、アニメーション対象となるsymbolを設定する。
        function TimelineImpl(symbol) {
            this.symbol = symbol;
            // タイムライン上にのせるアクションを定義する。FIFO形式で利用される。
            this._actionQueue = [];
            this._actionStatus = ActionStatus.YET_START;
            this._nowLoop = false;
            this._currentActionFrame = 0;
        }
        TimelineImpl.prototype.moveBy = function (x, y, frame) {
            var _this = this;
            var perX = x / frame, perY = y / frame;
            this.add(frame, null, function () {
                _this.symbol.moveBy(perX, perY);
            }, null);
            return this;
        };
        TimelineImpl.prototype.moveTo = function (x, y, frame) {
            var _this = this;
            var diffX = x - this.symbol.x, diffY = y - this.symbol.y;
            var perX = diffX / frame, perY = diffY / frame;
            this.add(frame, null, function () {
                _this.symbol.moveBy(perX, perY);
            }, null);
            return this;
        };
        TimelineImpl.prototype.scale = function (s, frame) {
            var _this = this;
            var perWidth = this.symbol.width * s - this.symbol.width / frame, perHeight = this.symbol.height * s - this.symbol.height / frame;
            this.add(frame, null, function () {
                _this.symbol.width += perWidth;
                _this.symbol.height += perHeight;
            }, null);
            return this;
        };
        TimelineImpl.prototype.delay = function (frame) {
            this.add(frame, function () {
            }, function () {
            }, function () {
            });
            return this;
        };
        TimelineImpl.prototype.then = function (action) {
            this.add(1, function () {
            }, action, function () {
            });
            return this;
        };
        TimelineImpl.prototype.repeat = function (frame, action) {
            this.add(frame, function () {
            }, action, function () {
            });
            return this;
        };
        TimelineImpl.prototype.loop = // ループを開始する。
        function () {
            this._nowLoop = true;
        };
        TimelineImpl.prototype.unloop = function () {
            this._nowLoop = false;
            return this;
        };
        TimelineImpl.prototype.add = // アクションを追加する
        function (frame, onactionstart, onactiontick, onactionend) {
            // ループの間の場合、追加は行わせない。
            if(!this._nowLoop) {
                this._actionQueue.push(new act.Action(frame, onactionstart, onactiontick, onactionend));
            }
            return this;
        };
        TimelineImpl.prototype.tick = // フレームごとの処理を行う。
        function () {
            if(this._actionStatus === ActionStatus.YET_START) {
                if(this._actionQueue.length > 0) {
                    this._actionQueue[0].onactionstart();
                    this._actionStatus = ActionStatus.STARTED;
                    this._currentActionFrame = this._actionQueue[0].frame;
                }
            }
            // アクションが存在する場合にはtickを呼び出す。
            // frameが0になった時点で、onactionendを呼び出し、キューから取り出す。
            if(this._actionQueue.length > 0) {
                if(this._currentActionFrame > 0) {
                    this._actionQueue[0].onactiontick();
                    this._currentActionFrame--;
                } else {
                    var action = this._actionQueue.shift();
                    action.onactionend();
                    // ループが実行中である場合、終了したアクションを末尾に追加して、繰り返しが行えるようにする。
                    if(this._nowLoop) {
                        this._actionQueue.push(action);
                    }
                    this._actionStatus = ActionStatus.YET_START;
                }
            }
        };
        return TimelineImpl;
    })();    
})
