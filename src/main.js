

var Firework = require("./firework")
var animation = require("./animation")
var world = new GL.Physics.World(new Box2D.Common.Math.b2Vec2(0, 9.8));
var game = new GL.Game(240, 320);
game.fps = 60;
game.onload = function (g) {
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var showCase = new Firework.StarCase(game.width, game.height);
    showCase.initialize(world.worldScale);
    showCase.walls.forEach(function (value) {
        game.currentScene.addEntity(value);
    });
    showCase.wallShapes.forEach(function (value, index, array) {
        world.addBody(array[index]);
    });
    var rc = function () {
        var r = Math.floor(Math.random() * 256 % 255) + 1, g = Math.floor(Math.random() * 256 % 255) + 1, b = Math.floor(Math.random() * 256 % 255) + 1;
        return new animation.Common.Color(r, g, b);
    };
    var rr = function () {
        var r = Math.floor(Math.random() * 16 % 16) + 1;
        return Math.max(r, 12);
    };
    var minX = showCase.leftBound, maxX = showCase.rightBound;
    var count = 0;
    var star_count = 0;
    game.currentScene.onenterframe = function (g) {
        if(++count == 20) {
            count = 0;
            var star = new Firework.Star();
            star.setColor(rc());
            star.x = 100;
            star.y = 0;
            g.currentScene.addEntity(star);
            world.add(new GL.Physics.BodyBinder(star, Firework.Star.createFixture(star, world.worldScale)));
            star_count++;
        }
        // 物理世界を更新する。
        world.step(1 / game.fps, 3, 3);
    };
    game.currentScene.ontouch = function (g, event) {
        var entities = g.currentScene.entities;
        var vec = animation.Common.Vector;
        // クリックした座標に星が存在するかどうかを調べる。
        entities = entities.filter(function (elem) {
            var center = new vec.Vector2D(elem.x + elem.width / 2, elem.y + elem.height / 2);
            var touched = new vec.Vector2D(event.clientX, event.clientY);
            return center.sub(touched).norm() < elem.width / 2;
        });
        entities.forEach(function (elem) {
            var elem = elem;
            elem.setColor(new animation.Common.Color(255, 0, 0, 1));
        });
        document.getElementById("textarea").innerHTML = "touched : " + event.clientX + ":" + event.clientY;
    };
    // 10フレーム毎に星を生成する。
    // game.rootScene.tl.then(() => {
    //     var star = new GL.Firework.Star(16, 16);
    //     star.setColor(rc());
    //     star.x = Math.max(maxX * Math.random(), minX);
    //     star.y = 0;
    //     game.rootScene.addChild(star);
    //     world.add(new GL.Physics.BodyBinder(
    //         star, GL.Firework.Star.createFixture(star, world.worldScale)));
    // }).delay(10).loop();
    window.addEventListener("devicemotion", function (e) {
        var x = e.accelerationIncludingGravity.x;
        var y = e.accelerationIncludingGravity.y;
        var z = e.accelerationIncludingGravity.z;
        // xyの傾きを使う
        var gravity = {
            x: 0,
            y: 0,
            z: 9.8
        };
        var gx = -x / 100 * 9.8;
        var gy = y / 100 * 9.8;
        world.gravity = new Box2D.Common.Math.b2Vec2(gx, gy);
    });
};
game.start();
//@ sourceMappingURL=main.js.map
