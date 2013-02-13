interface Game {
    assets:any;
}

declare interface EnchantEvent {
    localX:number;
    localY:number;

    target:any;
    type:string;
    x:number;
    y:number;
}

declare interface EnchantNode {
    age:number;
    parentNode:EnchantNode;
    scene:any;
    x:number;
    y:number;
}

declare interface EnchantEntity extends EnchantNode {
    backgroundColor:string;
    buttonMode:number;
    buttonPressed:bool;
    compisiteOperation:string;
    height:number;
    opacity:number;
    originX:number;
    originY:number;
    rotation:number;
    scaleX:number;
    scaleY: number;
    touchEnabled: bool;
    visible:bool;
    width:number;

    disableCollection():void;
    enableCollection():void;
    intersect(other:any):bool;
    rotate(deg:number):void;
    scale(x:number, y:number);
    within(other, distance:number): bool;
}

declare interface EnchantSurface {
    context:any;
    height:number;
    width:number;

    clear():void;
    clone():EnchantSurface;
    draw(src:any, srcX?:number, srcY?:number, srcW?:number, srcH?:number,
         dstX?:number, dstY?:number, dstW?:number, dstH?:number);
    getPixel(x:number, y:number):number[];
    setPixel(x:number,y:number, r:number, g:number,b:number,a:number);
    toDataURL():string;
}

declare interface EnchantSprite extends EnchantEntity {

    frame:number;
    height:number;
    image:EnchantSurface;
    width:number;
}


// declare class Sprite extends EnchantEntity {

//     constructor(width:number, height: number);
//     frame:number;
//     height:number;
//     image:EnchantSurface;
//     width:number;
// }

declare var enchant : {
    ():any;
    Class:any;
    Label:any;
    Event: {
        A_BUTTON_DOWN : string;
        A_BUTTON_UP : string;
        ACTION_ADDED : string;
        ACTION_END : string;
        ACTION_REMOVED : string;
        ACTION_START : string;
        ACTION_TICK : string;
        ADDED : string;
        ADDED_TO_SCENE : string;
        ADDED_TO_TIMELINE : string;
        B_BUTTON_DOWN : string;
        B_BUTTON_UP : string;
        CHILD_ADDED : string;
        CHILD_REMOVED : string;
        DOWN_BUTTON_DOWN : string;
        DOWN_BUTTON_UP : string;
        ENTER : string;
        ENTER_FRAME : string;
        EXIT : string;
        EXIT_FRAME : string;
        INPUT_CHANGE : string;
        INPUT_END : string;
        INPUT_START : string;
        LEFT_BUTTON_DOWN : string;
        LEFT_BUTTON_UP : string;
        LOAD : string;
        PROGRESS : string;
        REMOVED : string;
        REMOVED_FROM_SCENE : string;
        REMOVED_FROM_TIMELINE : string;
        RENDER : string;
        RIGHT_BUTTON_DOWN : string;
        RIGHT_BUTTON_UP : string;
        TOUCH_END : string;
        TOUCH_MOVE : string;
        TOUCH_START : string;
        UP_BUTTON_DOWN : string;
        UP_BUTTON_UP : string;

    };
};
declare var Label: any;
declare var Game: any;
declare var Sprite: {new(width:number, height:number): EnchantSprite;};
declare var Surface: {
    new(width:number, height:number) : EnchantSurface;
};
