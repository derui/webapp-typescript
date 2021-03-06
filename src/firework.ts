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

game.fps = 60;

game.onload = () => {

    var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,	b2Body = Box2D.Dynamics.b2Body
    ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;


    var showCase = new GL.Firework.StarCase(game.width, game.height);
    showCase.initialize(world.worldScale);
    showCase.walls.forEach((value, index, array) => {
        game.rootScene.addChild(array[index]);
    });
    showCase.wallShapes.forEach((value, index, array) => {
        world.addBody(array[index]);
    });

    var rc = () => {
        var r = Math.floor(Math.random() * 256 % 255) + 1,
        g = Math.floor(Math.random() * 256 % 255) + 1,
        b = Math.floor(Math.random() * 256 % 255) + 1;
        return new GL.Base.Color(r, g, b);
    };

    // var star = GL.Firework.Star.create(16, 16);
    // star.setColor(rc());
    // star.x = showCase.leftBound;
    // star.y = 16;
    // game.rootScene.addChild(star);
    // world.add(new GL.Physics.BodyBinder(
    //     star, GL.Firework.Star.createFixture(star, world.worldScale)));

    // star = GL.Firework.Star.create(16, 16);
    // star.setColor(rc());
    // star.x = showCase.leftBound;
    // star.y = 32;
    // game.rootScene.addChild(star);
    // world.add(new GL.Physics.BodyBinder(
    //     star, GL.Firework.Star.createFixture(star, world.worldScale)));

    game.addEventListener("enterframe", (e:EnchantEvent) => {
        // 物理世界を更新する。
        world.step(1/60, 3, 3);
    });

    var minX = showCase.leftBound, maxX = showCase.rightBound;
    game.rootScene.tl.then(() => {
        var star = GL.Firework.Star.create(16, 16);
        star.setColor(rc());
        star.x = Math.max(maxX * Math.random(), minX);
        star.y = 0;
        game.rootScene.addChild(star);
        world.add(new GL.Physics.BodyBinder(
            star, GL.Firework.Star.createFixture(star, world.worldScale)));
    }).delay(10).loop();

}

game.start();