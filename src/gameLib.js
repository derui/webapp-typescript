define(["require", "exports"], function(require, exports) {
    
    enchant();
    (function (Physics) {
        var World = (function () {
            function World(gravity, sleep) {
                if (typeof sleep === "undefined") { sleep = true; }
                this._worldScale = 100;
                this._binders = [];
                this._world = new Box2D.Dynamics.b2World(gravity, sleep);
            }
            Object.defineProperty(World.prototype, "worldScale", {
                get: function () {
                    return this._worldScale;
                },
                enumerable: true,
                configurable: true
            });
            World.prototype.add = // 渡されたbinderを登録する。binderがまだbindされていない場合、
            // 自身をbindの引数としてから登録する。
            function (binder) {
                if(!binder.binded) {
                    binder.bind(this);
                }
                this._binders.push(binder);
            };
            World.prototype.addBody = // 指定したBodyDefに基づいたBodyを追加し、追加したBodyを返す。
            function (def) {
                var body = this._world.CreateBody(def.bodyDef);
                body.CreateFixture(def.fixtureDef);
                return body;
            };
            World.prototype.remove = // 指定したtargetを持つadapterを削除する。
            function (target) {
                this._binders = this._binders.filter(function (value, index, array) {
                    array[index] != target;
                });
            };
            World.prototype.removeBody = // 指定したBodyを環境から取り除く。
            function (body) {
                this._world.DestroyBody(body);
            };
            World.prototype.step = // 物理世界の状況を更新する。
            function (rate, velocity, position) {
                var _this = this;
                this._world.Step(rate, velocity, position);
                this._world.ClearForces();
                this._binders.forEach(function (value, index, ary) {
                    ary[index].reflectBodyState(_this._worldScale);
                });
            };
            return World;
        })();
        Physics.World = World;        
        // BodyBindableとBodyをbindするクラス。
        // 実際にはBodyDefinitionのみを渡し、body生成はbindメソッドの呼び出し時に、
        // 渡されたworldについて行う。
        // Worldによって更新されたBodyの状態を、BodyBindableに反映する。
        var BodyBinder = (function () {
            function BodyBinder(target, bodyDef) {
                // すでにbody生成が行なわれている場合はtrue
                this._binded = false;
                this._target = target;
                this._bodyDef = bodyDef;
            }
            Object.defineProperty(BodyBinder.prototype, "binded", {
                get: function () {
                    return this._binded;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BodyBinder.prototype, "target", {
                get: function () {
                    return this._target;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BodyBinder.prototype, "body", {
                get: function () {
                    return this._body;
                },
                enumerable: true,
                configurable: true
            });
            BodyBinder.prototype.bind = // 渡されたbodyDefinitonからbodyを生成し、生成したBodyと
            // オブジェクトを結びつける。
            function (world) {
                if(!this._binded) {
                    this._body = world.addBody(this._bodyDef);
                    this._binded = true;
                }
            };
            BodyBinder.prototype.reflectBodyState = // Bodyの現在の位置をtargetに反映する。
            // worldScaleは、Bodyの位置・サイズを1として、pixelに変換する際の係数。
            // 1 meter / 100 pixelならば、100とする。
            function (worldScale) {
                var bodyPos = this._body.GetPosition(), me = this._target;
                // 剛体の座標は、物体の本来の位置と一致するように調整されているため、
                // 反映の際には修正した値を設定する。
                me.x = bodyPos.x * worldScale - me.width / 2;
                me.y = bodyPos.y * worldScale - me.height / 2;
            };
            return BodyBinder;
        })();
        Physics.BodyBinder = BodyBinder;        
    })(exports.Physics || (exports.Physics = {}));
    var Physics = exports.Physics;
    (function (Firework) {
        // Starを生成するためのファクトリ
        var Star = (function () {
            function Star() { }
            Star._singleton = null;
            Star._fixDef = (function () {
                var fix = new Box2D.Dynamics.b2FixtureDef();
                fix.density = 1.0// 密度
                ;
                fix.friction = 1.5// 摩擦係数
                ;
                fix.restitution = 0.2// 反発係数
                ;
                return fix;
            })();
            Star.create = // enchant.jsのenchant.Class.createでの拡張は、TypeScriptのやりかたではサポート
            // できないため、一部本来のJavaScriptとして扱う必要がある。
            function create(width, height) {
                if(Star._singleton != null) {
                    return new this._singleton(width, height);
                }
                var p = enchant.Class.create(Sprite, {
                    initialize: function () {
                        var _this = this;
                        Sprite.call(this, width, height);
                        var surf = new Surface(width, height);
                        this.image = surf;
                        this.x = 0;
                        this.y = 0;
                        this.frame = 1;
                        this.scaleX = 1.0;
                        this.scaleY = 1.0;
                        this.setColor = function (color) {
                            var surf = new Surface(width, height);
                            var r = width / 2;
                            var grad = surf.context.createRadialGradient(r * 0.7, r * 0.5, 1, r, r, r);
                            grad.addColorStop(0.0, "#fff");
                            grad.addColorStop(0.5, color.toFillStyle());
                            grad.addColorStop(1.0, "#000");
                            surf.context.fillStyle = grad;
                            surf.context.beginPath();
                            surf.context.arc(width / 2, width / 2, width / 2, 0, Math.PI * 2, false);
                            surf.context.fill();
                            _this.image = surf;
                            _this.color = color;
                        };
                    }
                });
                this._singleton = p;
                return new this._singleton(width, height);
            };
            Star.createFixture = // 渡されたstarに適合するbodyの設定を作成する。
            function createFixture(target, scale) {
                var fixDef = this._fixDef;
                var bodyDef = new Box2D.Dynamics.b2BodyDef();
                bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
                bodyDef.position.Set((target.x + target.width / 2) / scale, (target.y + target.height / 2) / scale);
                fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(target.width / 2 / scale);
                return {
                    bodyDef: bodyDef,
                    fixtureDef: fixDef
                };
            };
            return Star;
        })();
        Firework.Star = Star;        
        var StarCaseOption = (function () {
            function StarCaseOption() {
                // 左右両壁の幅
                this.sideWallThickness = 10;
                // 地面の厚み
                this.groundThickness = 10;
            }
            return StarCaseOption;
        })();
        Firework.StarCaseOption = StarCaseOption;        
        // width / heightにあてはまるオブジェクトを生成する。
        var StarCase = (function () {
            function StarCase(width, height) {
                this.width = width;
                this.height = height;
                this.walls = [];
                this.wallShapes = [];
            }
            StarCase.prototype.initialize = function (scale, option) {
                if (typeof option === "undefined") { option = new StarCaseOption(); }
                var sideThick = option.sideWallThickness, ground = option.groundThickness;
                this.walls.push(this.createWall(0, 0, sideThick, this.height));
                this.walls.push(this.createWall(this.width - sideThick, 0, sideThick, this.height));
                this.walls.push(this.createWall(0, this.height - ground, this.width, ground));
                // ここで作成される剛体は、見ためのSpriteの倍に相当する剛体とする
                this.wallShapes.push(this.createShape(scale, -sideThick, 0, sideThick * 2, this.height * 2));
                this.wallShapes.push(this.createShape(scale, this.width - sideThick, 0, sideThick * 2, this.height * 2));
                this.wallShapes.push(this.createShape(scale, 0, this.height - ground, this.width * 2, ground * 2));
                this.leftBound = sideThick;
                this.rightBound = this.width - sideThick;
                this.groundBound = this.height - ground;
            };
            StarCase.prototype.createWall = // 壁に相当するspriteを作る
            function (x, y, w, h) {
                var p = new Sprite(w, h);
                var surf = new Surface(w, h);
                surf.context.beginPath();
                surf.context.fillRect(0, 0, w, h);
                surf.context.fill();
                p.image = surf;
                p.x = x;
                p.y = y;
                p.frame = 1;
                return p;
            };
            StarCase.prototype.createShape = // 壁に相当する剛体を作る。
            function (scale, x, y, w, h) {
                var b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
                var fixDef = new b2FixtureDef();
                fixDef.density = 1.0;
                fixDef.friction = 1.5;
                fixDef.restitution = 0.2;
                var bodyDef = new b2BodyDef();
                bodyDef.type = b2Body.b2_staticBody;
                bodyDef.position.Set((x + w / 2) / scale, (y + h / 2) / scale);
                fixDef.shape = new b2PolygonShape();
                fixDef.shape.SetAsBox(w / scale / 2, h / scale / 2);
                return {
                    bodyDef: bodyDef,
                    fixtureDef: fixDef
                };
            };
            return StarCase;
        })();
        Firework.StarCase = StarCase;        
    })(exports.Firework || (exports.Firework = {}));
    var Firework = exports.Firework;
    // canvas element only.
    (function (Base) {
        var Color = (function () {
            function Color(r, g, b, a) {
                if (typeof r === "undefined") { r = 0; }
                if (typeof g === "undefined") { g = 0; }
                if (typeof b === "undefined") { b = 0; }
                if (typeof a === "undefined") { a = 1.0; }
                this.r = r;
                this.g = g;
                this.b = b;
                this.a = a;
            }
            Color.prototype.toFillStyle = function () {
                var colors = [
                    this.r.toString(), 
                    this.g.toString(), 
                    this.b.toString(), 
                    this.a.toString()
                ].join(',');
                return "rgba(" + colors + ")";
            };
            return Color;
        })();
        Base.Color = Color;        
    })(exports.Base || (exports.Base = {}));
    var Base = exports.Base;
})
