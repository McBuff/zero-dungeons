
function drawGrid(){
  let canv = document.getElementById("myCanvas1");
  let ctx = canv.getContext("2d");
  
  let cWidth = canv.width;
  let cHeight = canv.height;
  let i;
  
  for (i = 0; i < cWidth; i+=20) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, cHeight);
    ctx.stroke();
  }

  for (i = 0; i < cHeight; i+=20) {
    ctx.moveTo(0, i);
    ctx.lineTo(cWidth, i);
    ctx.stroke();
  }

}


//simple rando nr gen
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
// Test van var
//console.log(objTown.Name);

