// Core logic happens here
import * as PIXI from './pixi/pixi.min.js';

class main{
    constructor(doc){
        this.document = doc;
        const canvas = document.getElementById('mycanvas');
        this.app = new PIXI.Application({view: canvas, width: window.innerWidth, height: window.innerHeight});
        this.texture = PIXI.Texture.from('img/sprite.png');
        this.sprite = new PIXI.Sprite(texture);
        
    }

    run()
    {
        
    }
}