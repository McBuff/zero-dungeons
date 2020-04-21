function handleDiceRoll(){
    
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
    }
}

function clearlog(){
    console.log("Clear log called");
}

function writeServerLog(line){
    console.log("server log");
}