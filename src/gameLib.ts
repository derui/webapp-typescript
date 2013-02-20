/// <reference path='../lib/Box2dWeb.d.ts' />

import util = module("util");
import animation = module("animation");

export interface Group {

    onenterframe: (game: Game) => void;
    onload: (game: Game) => void;
    ontouch: (game: Game, event: MouseEvent) => void;

    entities: Entity[];

    /**
     * 管理対象のentityを追加する
     */
    addEntity(entity: Entity): void;

    /**
     * 指定されたEntityを削除する
     */
    removeEntity(entity: Entity): void;

    // 指定されたcontextに対してレンダリングを行う
    render(context: animation.Context): void;
}

// ゲーム内における各シーンのインターフェース。
export interface Scene extends Group {}

// ゲーム内シーンの構成単位。各シーン間で、登録されているオブジェクトなどは独立している。
export class SceneImpl implements Scene {

    // FPSにおける各フレームに入った段階で実行される関数
    onenterframe: (game: Game) => void = null;
    onload: (game: Game) => void = null;
    ontouch: (game: Game, event: MouseEvent) => void = null;

    // 各シーンに存在するオブジェクト
    private _entities: Entity[] = [];

    get entities(): Entity[] { return this._entities; }

    constructor() {
    }

    /**
     * 管理対象のentityを追加する
     */
    addEntity(entity: Entity): void {
        this._entities.push(entity);
    }

    /**
     * 指定されたEntityを削除する
     */
    removeEntity(entity: Entity): void {
        var index = this._entities.indexOf(entity);
        if (index != -1) {
            this._entities = this._entities.splice(index, 1);
        }
    }

    // 指定されたcontextに対してレンダリングを行う
    render(context: animation.Context): void {
        context.clear();
        this._entities.forEach(elem => elem.render(context));
    }
}

// Gameで格納されるオブジェクトのベース
export interface Entity extends animation.Symbolize {
    // 渡されたObjectベースの矩形同士が衝突しているかどうかを返す
    intersect(other: Entity): bool;
    // ObjectBaseの中心点同士が衝突しているかどうかを返す。
    // distanceが渡されない場合、distanceのデフォルト値はObjectBaseの横幅と
    // 高さの平均値が使われる
    within(other: Entity, distance?: number): bool;
}

export module BaseClasses {

    // 渡されたSymbolオブジェクトを、Entityとして扱うためのプロキシクラス。
    export class EntityProxy implements Entity {
        private _symbol: animation.Symbolize;

        // 各プロパティに対するgetter
        get x(): number { return this._symbol.x; }
        get y(): number { return this._symbol.y; }
        get width(): number { return this._symbol.width; }
        get height(): number { return this._symbol.height; }
        get zIndex(): number { return this._symbol.zIndex; }
        get visible(): bool { return this._symbol.visible; }

        // 各プロパティに対するsetter
        set x(_x: number) { this._symbol.x = _x; }
        set y(_y: number) { this._symbol.y = _y; }
        set width(_width: number) { this._symbol.width = _width; }
        set height(_height: number) { this._symbol.height = _height; }
        set zIndex(_z: number) { this._symbol.zIndex = _z; }
        set visible(v: bool) { this._symbol.visible = v; }

        constructor(symbol: animation.Symbolize) {
            this._symbol = symbol;
        }

        moveBy(x: number, y: number) {
            this._symbol.moveBy(x, y);
        }

        moveTo(x: number, y: number) {
            this._symbol.moveTo(x, y);
        }

        render(context: animation.Context): void {
            this._symbol.render(context);
        }

        // 二つの矩形に対するあたり判定を行う。触れている状態の場合は、intersectとは判定しない
        intersect(other: Entity): bool {
            return Intersector.intersect(this, other);
        }

        // ちょうどdistanceの距離となる場合は、withinと判定しない
        within(other: Entity, distance? = -1): bool {
            return Intersector.within(this, other, distance);
        }
    }

    // Entity同士の衝突判定処理をまとめて提供するクラス。このクラス自体に影響するような
    // 処理は存在しない
    module Intersector {
        // 二つの矩形に対するあたり判定を行う。触れている状態の場合は、intersectとは判定しない
        export function intersect(one: Entity, other: Entity): bool {
            if (one == null || other == null) {
                return false;
            }

            var rectone = {
                left: one.x,
                top: one.y,
                right: one.x + one.width,
                bottom: one.y + one.height
            },
            rectOther = {
                left: other.x,
                top: other.y,
                right: other.x + other.width,
                bottom: other.y + other.height
            }

            if (rectone.right <= rectOther.left) {
                return false;
            } else if (rectone.left >= rectOther.right) {
                return false;
            } else if (rectone.bottom <= rectOther.top) {
                return false;
            } else if (rectone.top >= rectOther.bottom) {
                return false;
            } else {
                return true;
            }
        }

        // ちょうどdistanceの距離となる場合は、withinと判定しない
        export function within(one: Entity, other: Entity, distance? = -1): bool {
            if (distance == -1) {
                // distanceが設定されない場合、互いのwidth/heightの平均値が利用される
                distance = (one.width + other.width + one.height + other.height) / 4;
            }

            // Entityのx/y座標は、すべて矩形の左上座標を表すため、一度それぞれの中心座標を計算する。
            var vec = animation.Common.Vector;
            var oneC = new vec.Vector2D(one.x + one.width / 2, one.y + one.height / 2);
            var otherC = new vec.Vector2D(one.x + one.width / 2, one.y + one.height / 2);
            var dist = oneC.sub(otherC).norm();

            return dist < distance;
        }
    }

    export class EntityImpl extends animation.Symbol {

        constructor() {
            super();
        }

        // 二つの矩形に対するあたり判定を行う。触れている状態の場合は、intersectとは判定しない
        intersect(other: Entity): bool {
            return Intersector.intersect(this, other);
        }

        // ちょうどdistanceの距離となる場合は、withinと判定しない
        within(other: Entity, distance? = -1): bool {
            return Intersector.within(this, other, distance);
        }
    }

}

// フレームベースでの更新処理を提供するゲームクラス。レンダリングが呼び出されるタイミング
// についても、ここで指定したフレームのタイミングとなる
export class Game {

    // デフォルトのFPS
    private _fps: number = 30;

    private _intervalHandle: number;
    private _isGameStarted: bool = false;

    // レンダリング対象のコンテキスト
    private _targetContext: animation.Context;

    // 各シーンのstack
    private _sceneStack: Scene[] = [];

    // 内部で作成するcanvasのID
    private _gameCanvasId: string = "game-canvas";

    get fps(): number { return this._fps; }
    set fps(f: number) { this._fps = f; }

    // Sceneスタックは、最低一つ必ず積まれている
    get currentScene(): Scene { return this._sceneStack[this._sceneStack.length - 1]; }

    constructor(public width: number, public height: number) {

        // レンダリング対象となるCanvasを追加する
        var elem = document.createElement("canvas");
        elem.id = this._gameCanvasId;
        elem.setAttribute("width", width.toString());
        elem.setAttribute("height", height.toString());

        // タッチ/マウスでそれぞれ同一のハンドラを利用する
        elem.addEventListener("touchstart", (e: MouseEvent) => {
            if (this.currentScene.ontouch != null) {
                this.currentScene.ontouch(this, e);
            }
        });
        elem.addEventListener("click", (e: MouseEvent) => {
            if (this.currentScene.ontouch != null) {
                this.currentScene.ontouch(this, e);
            }
        });

        var canvas = <HTMLCanvasElement>elem;
        this._targetContext = new animation.Context(canvas);
        document.body.appendChild(elem);

        this._sceneStack.push(new SceneImpl());
    }

    /**
     * ゲームループを開始する。
     */
    start(): void {
        if (this._isGameStarted) {
            return;
        }

        if (this.currentScene.onload && !this._isGameStarted) {
            this.currentScene.onload(this);
        }

        this._intervalHandle = window.setInterval(() => {
            if (this.currentScene.onenterframe) {
                this.currentScene.onenterframe(this);
            }

            this.render();

        }, 1000 / this._fps);
        this._isGameStarted = true;
    }

    /**
     * 開始されたゲームループを停止する。
     */
    stop(): void {
        window.clearInterval(this._intervalHandle);
        this._intervalHandle = null;
        this._isGameStarted = false;
    }

    pushScene(scene: Scene): void {
        if (scene != null) {
            this._sceneStack.push(scene);
        }
    }

    // スタックからSceneをpopする。ただし、現在のsceneがrootである場合は、
    // popされずにnullが返される
    popScene(): Scene {
        if (this._sceneStack.length == 1) {
            return null;
        } else {
            return this._sceneStack.pop();
        }
    }

    private render(): void {
        this.currentScene.render(this._targetContext);
    }
}

// Box2DWebをラッピングして利用しやすくしたクラスを提供するモジュール
export module Physics {
    export class World {
        private _world: B2World;
        private _worldScale: number = 100;
        private _binders: BodyBinder[] = [];
        get worldScale(): number { return this._worldScale; }

        get gravity(): B2Vec2 { return this._world.GetGravity(); }
        set gravity(vec) { return this._world.SetGravity(vec); }

        constructor(gravity: B2Vec2, sleep = true) {
            this._world = new Box2D.Dynamics.b2World(gravity, sleep);
        }

        // 渡されたbinderを登録する。binderがまだbindされていない場合、
        // 自身をbindの引数としてから登録する。
        add(binder: BodyBinder): void {
            if (!binder.binded) {
                binder.bind(this);
            }
            this._binders.push(binder);
        }

        // 指定したBodyDefに基づいたBodyを追加し、追加したBodyを返す。
        addBody(def: BodyDefinition): B2Body {
            var body = this._world.CreateBody(def.bodyDef);
            body.CreateFixture(def.fixtureDef);
            return body;
        }

        // 指定したtargetを持つadapterを削除する。
        remove(target: BodyBinder): void {
            this._binders = this._binders.filter((value, index, array) => {
                array[index] != target
            });
        }

        // 指定したBodyを環境から取り除く。
        removeBody(body: B2Body): void {
            this._world.DestroyBody(body);
        }

        // 物理世界の状況を更新する。
        step(rate: number, velocity: number, position: number): void {

            this._world.Step(rate, velocity, position);
            this._world.ClearForces();
            this._binders.forEach((value, index, ary) => {
                ary[index].reflectBodyState(this._worldScale);
            });
        }
    }

    // BodyBindableとBodyをbindするクラス。
    // 実際にはBodyDefinitionのみを渡し、body生成はbindメソッドの呼び出し時に、
    // 渡されたworldについて行う。
    // Worldによって更新されたBodyの状態を、BodyBindableに反映する。
    export class BodyBinder {
        // すでにbody生成が行なわれている場合はtrue
        private _binded = false;
        private _target: BodyBindable;
        private _bodyDef: BodyDefinition;
        private _body: B2Body;
        get binded(): bool { return this._binded; }
        get target(): BodyBindable { return this._target; }
        get body(): B2Body { return this._body; }

        constructor(target: BodyBindable, bodyDef: BodyDefinition) {
            this._target = target;
            this._bodyDef = bodyDef;
        }

        // 渡されたbodyDefinitonからbodyを生成し、生成したBodyと
        // オブジェクトを結びつける。
        bind(world: World): void {
            if (!this._binded) {
                this._body = world.addBody(this._bodyDef);
                this._target.body = this._body;
                this._binded = true;
            }
        }

        // Bodyの現在の位置をtargetに反映する。
        // worldScaleは、Bodyの位置・サイズを1として、pixelに変換する際の係数。
        // 1 meter / 100 pixelならば、100とする。
        reflectBodyState(worldScale: number): void {
            var bodyPos = this._body.GetPosition()
            , me = this._target;

            if (me.onreflect()) {
                // 剛体の座標は、物体の本来の位置と一致するように調整されているため、
                // 反映の際には修正した値を設定する。
                me.x = bodyPos.x * worldScale - me.width / 2;
                me.y = bodyPos.y * worldScale - me.height / 2;
            }
        }
    }

    // Bodyの設定をまとめたもの
    export interface BodyDefinition {
        fixtureDef: B2FixtureDef;
        bodyDef: B2BodyDef;
    }

    // Bodyと描画する実体を接続するためのインターフェース。
    // このインターフェースを実装したクラスは、BodyBinderを利用して
    // BodyControllerで管理することができる。
    export interface BodyBindable {
        // Bodyと接続する物体の位置
        x: number;
        y: number;
        // 物体のサイズ(full size)
        width: number;
        height: number;
        body: B2Body;

        // reflectBodyState実行時に実行される処理。
        // trueが返された場合には、本来のreflectBodyStateの処理も行われる。
        onreflect(): bool;
    }
}
