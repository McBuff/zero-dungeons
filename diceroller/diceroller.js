//import * as die from die.js;



function GenerateGuid()
{
    var sGuid = "";
    for (var i = 0; i< 32; i++)
    {
        sGuid += Math.floor(Math.random() * 0xF).toString(0xF);
    };
    return sGuid;
}

class die{
    constructor(sides, result =  -1){
        self.sides = sides;
        self.result = result;
        self.guid = GenerateGuid();

    }

    roll() {
        console.log('Die rolled with GUID:'+ guid);
        
    }

    // _createguid(){
    //     var sGuid = "";
    //     for (var i = 0; i< 32; i++)
    //     {
    //         sGuid += Math.floor(Math.random() * 0xF).toString(0xF);
    //     }
    //     return sGuid;
    // }
    
};


function handleDiceRoll(){
    
    for (let i = 0; i < 20; ++i) {
        var d  = new die( 20);
        console.log('die '+ (i+1) );
        d.roll();        
    };
    


    // user has clicked button    
    
    // Retreive user selected dice
    // TODO:
    
    // Get user chosen dice

    // S/C: Roll dice
    
    // C: Message server that a dice has been rolled, join dice data
    
    // S: send dice output to users

    // S: add dice output to log

    // C: show dice ouput?



    
    rollDice("this should be a die", "so should this");

    var container = $("<dicelog>");
    
    var owner = $("<text>");
    owner.value = "Deus";
    
    container.append(owner);
    var elem = document.getElementById('log');
    // elem.append(elem);
    
    
    console.log("rolled dice, result = X");
}

function sendRollToServer(dicerollData){

}
function rollDice(){
    for (i = 0; i < arguments.length; i++)
    {
        console.log("Rolling dice '" + arguments[i]+ "'");
    };
}

function clearlog(){
    console.log("Clear log called");
}

function writeServerLog(line){
    console.log("server log");
}