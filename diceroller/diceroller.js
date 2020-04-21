function rolldice(){
    console.log("sano is een zandneger");

    // 1. Roll Dice (defined by user?)
    // 2. Create html elements to display stuff
    // 3. Fill html elments
        // user, roll, details
    
    

    var container = $("<dicelog>");
    
    var owner = $("<text>");
    owner.value = "Deus";
    
    container.append(owner);
    var elem = document.getElementById('log');
    // elem.append(elem);
    
    console.log("rolled dice, result = X");
}

function clearlog(){
    console.log("Clear log called");
}