/// <reference path='../lib/jquery.d.ts' />
/// <reference path='../lib/Box2dWeb.d.ts' />
/// <reference path='../lib/enchant.d.ts' />
/// <reference path='gameLib.ts' />

import firework = module("stage");
import util = module("util");
import GL = module("gameLib");
var world = new GL.Physics.World(new Box2D.Common.Math.b2Vec2(0, 9.8));

enchant();

var game = new Game(480, 640);

game.preload.call(game, [1,2,3,4,5,6].map((value, index, array) => {
    return GL.Firework.Star.getStarImageName(value);
}));
game.scale = 2;
game.fps = 60;

game.onload = () => {
    // init();

    var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,	b2Body = Box2D.Dynamics.b2Body
    ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;       // 密度
    fixDef.friction = 1.5;      // 摩擦係数
    fixDef.restitution = 0.2;   // 反発係数

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(0, 16 / world.worldScale);
    fixDef.shape = new b2CircleShape(8 / world.worldScale);

    var rc = () => {
        var r = Math.floor(Math.random() * 256 % 255) + 1,
        g = Math.floor(Math.random() * 256 % 255) + 1,
        b = Math.floor(Math.random() * 256 % 255) + 1;
        return new GL.Base.Color(r, g, b);
    };


    var showCase = new GL.Firework.StarCase(game.width, game.height);
    showCase.initialize(world.worldScale);
    showCase.walls.forEach((value, index, array) => {
        game.rootScene.addChild(array[index]);
    });
    showCase.wallShapes.forEach((value, index, array) => {
        world.addBody(array[index]);
    });

    var star = GL.Firework.Star.create(16, 16);
    star.setColor(rc());
    star.x = showCase.leftBound;
    star.y = 16;
    game.rootScene.addChild(star);
    world.add({bodyDef : bodyDef, fixtureDef: fixDef}, star);

    fixDef.shape = new b2CircleShape(8 / world.worldScale);
    bodyDef.position.Set(0, 32 / world.worldScale);
    star = GL.Firework.Star.create(16, 16);

    star.setColor(rc());
    star.x = showCase.leftBound;
    star.y = 32;
    game.rootScene.addChild(star);
    world.add({bodyDef : bodyDef, fixtureDef: fixDef}, star);


    game.addEventListener("enterframe", (e:EnchantEvent) => {
        // 物理世界を更新する。
        world.step(1/60, 3, 3);
    });
};

game.start();

function init(): void {
    var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,	b2Body = Box2D.Dynamics.b2Body
    ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,	b2World = Box2D.Dynamics.b2World
    ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

    // decided that 1 meter = 100 pixels

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;       // 密度
    fixDef.friction = 1.5;      // 摩擦係数
    fixDef.restitution = 0.2;   // 復帰係数

    var bodyDef = new b2BodyDef();

    //create ground
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.Set(3, game.height / 100 + 1);
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(10, 1);

    world.addBody({bodyDef: bodyDef, fixtureDef:fixDef});

    fixDef.shape.SetAsBox(1, 100);
    // left wall
    bodyDef.position.Set(-1, 3);
    world.addBody({bodyDef:bodyDef, fixtureDef: fixDef});

    // right wall
    console.log(game.width.toString());
    bodyDef.position.Set(game.width / 100 + 1, 3);
    world.addBody({bodyDef:bodyDef, fixtureDef:fixDef});
}