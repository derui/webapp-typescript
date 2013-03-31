/// <reference path='../lib/jquery.d.ts' />
/// <reference path='../lib/Box2dWeb.d.ts' />

import GL = module("gameLib");
import Firework = module("firework");
import animation = module("animation");
import di = module("deviceInfo");
var world = new GL.Physics.World(new Box2D.Common.Math.b2Vec2(0, 9.8));

var game = new GL.Game(240, 320);

interface DeviceMotionEvent extends Event {
    accelerationIncludingGravity: { x: number; y: number; z: number; };
}

// Android������ȊO����fps��ύX����B
if (di.isAndroid()) {
    game.fps = 15;
} else {
    game.fps = 60;
 }

function isContainPosition(x:number, y:number, elem:GL.Entity) : bool {
    var vec = animation.Common.Vector;
    var center = new vec.Vector2D(elem.x + elem.width / 2,
                                  elem.y + elem.height / 2);
    var origin = di.getOriginPoint(x, y);
    console.log(x + " " + y + ":" + origin.x + " " + origin.y);
    var touched = new vec.Vector2D(origin.x, origin.y);

    return center.sub(touched).norm() < elem.width / 2;
}

var gameOption = {
    frameToGameOver : 90 * game.fps,
}

game.onload = (g) => {
    di.initDevice(240, 320);

    var b2Vec2 = Box2D.Common.Math.b2Vec2;

    var showCase = new Firework.GameObj.StarCase(game.width, game.height);
    showCase.initialize(world.worldScale);
    showCase.walls.forEach((value) => {
        value.enableCorrect = false;
        game.currentScene.addEntity(value);
    });
    
    showCase.wallShapes.forEach((value, index, array) => {
        world.addBody(array[index]);
    });

    game.currentScene.addEntity(new Firework.GameObj.DeadLine(
        game.width, game.height * 0.05));

    var rc = () => {
        var r = Math.floor(Math.random() * 256 % 255) + 1,
        g = Math.floor(Math.random() * 256 % 255) + 1,
        b = Math.floor(Math.random() * 256 % 255) + 1;
        return new animation.Common.Color(r, g, b);
    };

    var minX = showCase.leftBound, maxX = showCase.rightBound;
    var count = 0;
    var frameCount = 0;
    game.currentScene.on(GL.EventConstants.ENTER_FRAME, (e) => {

        if (++frameCount === gameOption.frameToGameOver) {
            game.pushScene(new Firework.Scenes.GameOver(game));
        }
        
        if (++count == game.fps) {
            count = 0;
            var star = new Firework.GameObj.Star();
            star.color = rc();
            star.x = 100;
            star.y = 0;
            var body = new GL.Physics.BodyBinder(
                star, star.createFixture(world.worldScale));
            star.listener.on(GL.EventConstants.TOUCH_START, star.makeTouchStartHandler(game.currentScene));
            star.listener.on(GL.EventConstants.TOUCH_END, star.makeTouchEndHandler(game.currentScene));
            star.listener.on(GL.EventConstants.REMOVE, (e) => {
                // entity���폜���ꂽ��A�֘A����body���폜����B
                world.remove(body);
            });

            game.currentScene.addEntity(star);
            world.add(body);
        }

        // �������E���X�V����B
        world.step(1 / game.fps, 3, 3);

    });

    game.currentScene.on(GL.EventConstants.TOUCH_END, (event: MouseEvent) => {
        var entities = game.currentScene.entities;
        // �N���b�N�������W�ɐ������݂��邩�ǂ����𒲂ׂ�B
        entities = entities.filter((elem) => {
            return isContainPosition(event.clientX, event.clientY, elem)
        });

        entities.forEach((elem) => {
            elem.listener.fire(GL.EventConstants.TOUCH_END, event);
        });
    });

    game.currentScene.on(GL.EventConstants.TOUCH_START, (event: MouseEvent) => {
        var entities = game.currentScene.entities;
        // �N���b�N�������W�ɐ������݂��邩�ǂ����𒲂ׂ�B
        entities = entities.filter((elem) => {
            return isContainPosition(event.clientX, event.clientY, elem)
        });

        entities.forEach((elem) => {
            elem.listener.fire(GL.EventConstants.TOUCH_START, event);
        });
    });

    window.addEventListener("devicemotion", (e: DeviceMotionEvent) => {
        var x = e.accelerationIncludingGravity.x;
        var y = e.accelerationIncludingGravity.y;
        var z = e.accelerationIncludingGravity.z;

        // xy�̌X�����g��
        var gravity = { x: 0, y: 0, z: 9.8 };
        var gx = -x / 100 * 9.8;
        var gy = y / 100 * 9.8;
        world.gravity = new Box2D.Common.Math.b2Vec2(gx, gy);

    });
}

game.start();