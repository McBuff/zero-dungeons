// insert some code for shared map.
// Library to be used, Pixie.jsP
// following tutorial: https://www.youtube.com/watch?v=GuY_PROTr0I
PIXI.utils.sayHello();
const canvas = document.getElementById('mycanvas');
const app = new PIXI.Application({view: canvas, width: window.innerWidth, height: window.innerHeight});
//document.body.appendChild(app.view);
//document.getElementById('mycanvas').appendChild(app.view);

const texture = PIXI.Texture.from('img/sprite.png');
const sprite = new PIXI.Sprite(texture);

sprite.x = app.renderer.width/2;
sprite.y = app.renderer.height /2;

sprite.anchor.x = .5;
sprite.anchor.y = .5;

app.stage.addChild(sprite);

app.ticker.add (animate);

function animate(){
    
    sprite.rotation += 0.05;
}