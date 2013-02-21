define(["require", "exports", "gameLib", "firework", "animation"], function(require, exports, __GL__, __Firework__, __animation__) {
    /// <reference path='../lib/jquery.d.ts' />
    /// <reference path='../lib/Box2dWeb.d.ts' />
    var GL = __GL__;

    var Firework = __Firework__;

    var animation = __animation__;

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
        var blue = new animation.Common.Color(0, 0, 255);
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
        game.currentScene.on(GL.EventConstants.ENTER_FRAME, function (e) {
            if(++count == 20) {
                count = 0;
                var star = new Firework.Star();
                star.color = rc();
                star.x = 100;
                star.y = 0;
                star.listener.on(GL.EventConstants.TOUCH_START, star.makeTouchedHandler(game.currentScene));
                game.currentScene.addEntity(star);
                world.add(new GL.Physics.BodyBinder(star, star.createFixture(world.worldScale)));
                star_count++;
            }
            // �������E���X�V�����B
            world.step(1 / game.fps, 3, 3);
        });
        game.currentScene.on(GL.EventConstants.TOUCH_START, function (event) {
            var entities = game.currentScene.entities;
            var vec = animation.Common.Vector;
            // �N���b�N�������W�ɐ������݂��邩�ǂ����𒲂ׂ��B
            entities = entities.filter(function (elem) {
                var center = new vec.Vector2D(elem.x + elem.width / 2, elem.y + elem.height / 2);
                var touched = new vec.Vector2D(event.clientX, event.clientY);
                return center.sub(touched).norm() < elem.width / 2;
            });
            entities.forEach(function (elem) {
                elem.listener.fire(GL.EventConstants.TOUCH_START, event);
            });
        });
        // 10�t���[�����ɐ��𐶐������B
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
            // xy�̌X�����g��
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
})
