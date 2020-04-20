// Generate 
let objTown = {
    Name:getRandomInt(1000000000).toString(26),
    Pop:getRandomInt(9999).toString(),
    Style:"placeholder",
    River:true,
    Sea:true,
    Walls:true,
    Keep:true
};

//simple rando nr gen  to use to fill vars 
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

// Test van var
console.log(objTown.Name);

