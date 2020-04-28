  
      
    var socket = io();
    

    socket.on('disconnect', function(){
        alert('Disconnected from server');
        window.location.reload(false);
    })

    // init login fields
    var divSign = document.getElementById('divSign');
    var divSignUsername = document.getElementById('divSign-username');
    divSignUsername.value = "";
    var divSignPassword = document.getElementById('divSign-password');
    var divSignSignIn = document.getElementById('divSign-signin');
    var divsignLogindataFormName = document.getElementById('divSign-logindataform');


    var divOptionsPlayAudio = document.getElementById('divOptions-playsounds');

    var divClient = document.getElementById('divClient');
    //var divClientRoll = document.getElementById('divClient-Roll');
    var divClientPlayerlist = document.getElementById('divClient-playerlist');
    var divClientRollResults = document.getElementById('divClient-RollResults');
    var divClientDiceText = document.getElementById('divClient-dicetext');
    var divClientDiceTextParsePreview = document.getElementById('divClient-dicetextParsePreview');

    var divClientDiceRollForm = document.getElementById('divClient-RollForm');


    function submitSignIn(){
        // validate forms , then log in
        if(divSignUsername.value.length > 0){
            console.debug('Submitting login data');
            socket.emit('clientSignIn',{
                    username:divSignUsername.value,
                    password:divSignPassword.value
                });
        }
    }

    //divSignSignIn.onclick = function(){ submitSignIn();}

    divsignLogindataFormName.onsubmit = function(e){
        e.preventDefault(); // IMPORTANT, this prevents HTML from refreshing the page.               
        console.log('logindata: OnSubmit')
        submitSignIn();
    }

    socket.on('clientSignInResponse', function(res){
            if(res.succes){
                console.log('Login succes!');
                divSign.style="display:None;";
                divClient.style="display:inline-block;";
                
                setTimeout( function(){divClientDiceText.focus();}, 50); // slight delay to prevant problems names
                divClientDiceText.value = '';
            }
            else{
                alert('Acces denied!');
            } 
    });
    //-----------

    /// converts single die texts like '+3d20' into arrays of numbers [20,20,20]
    function parseDie(diestr){
        
        var result = [];
        var sign = 1; // 1  / -1
        var multiplier = 1;
        var dieSides = 0;

        let c = ''; //console message

        // if the die is signed, retreive the sign and fillin 'sign' with +1 / -1
        // i know the die is signed by testing only the first character
        // i also only test if the sign is negative, I defaulted to positive in declaration.
        if( /[-+]/.test(diestr.slice(0,1)) ){
            if(diestr.slice(0,1) === '-') sign = -1;
        }
        
        // get dice modifiers by first getting the number in front of 'd' + the 'd'
        // ex: 1d10 -> '1d'
        // then cut the d and parse the remaining number
        var reNumDice = /\d*d/i;
        var reNumDiceResult= reNumDice.exec(diestr);
        if(reNumDiceResult)
        {   
            

            let die = reNumDiceResult[0].replace(/d/i, '');
            if(die.length === 0) die = '1';

            multiplier = parseInt(die);           
            
        }

        // get dice SIDES by getting last number (number after d & end of string)
        var reDiceSides = /\d*$/; //any digit at the end of the string is considered a SidesCount
        var reDiceSidesResult = reDiceSides.exec(diestr);
        if(reDiceSidesResult){
            let sides = reDiceSidesResult[0];
            if(sides.length != 0)
            dieSides  = parseInt(sides);
        }

        // create list of dice
        for(var i = 0; i < multiplier; i++){
            if(dieSides!== 0) result.push(dieSides * sign);
        }
        return result;
    
    }
    
    /// converts single die mod text like '+150' into a signed number 150
    function parseDieModifier(modifierstr){

        let result = 0;
        let sign = 1;
        let modifier = 0;
        let c = ''; // console log message

        c += ('Parsing modifier ' + modifierstr+ ' got: ');

        // get modifier sign (-/+), check if there is a -, otherwise default to +
        var modifierMatches = /[-+]/.exec(modifierstr);
        if(modifierMatches){
            if( /-/.test(modifierstr) ) sign = -1;
        }

        modifierval = modifierstr.replace(/[-+]/, '');
        modifier = parseInt(modifierval);

        result = modifier * sign;
        c += result;
        console.info(c);

        return result;
    }

    function parseDiceString(dicestring){

        // structure of return value
        var parsedData = {dice:[],modifiers:[]};

        // regex the diceroll input form, force to lowercase  and remove whitespace
        var dicetext=  divClientDiceText.value.toLowerCase();
        dicetext= dicetext.replace(/\s/, ''); // removes all whitespaces
        console.log('regexing dicetext ' + dicetext)

    
        // get all dice (any format any size)
        var reDice = /[-+]?\d*[dD]\d*/ig; //ex: [1d20, +1d20,-1d20, +d20, 1D120]
        //var reDice = /[-+]?(?<!\w)\d*(?i)d\d*/; //ex: [1d20, +1d20,-1d20, +d20, 1D120]
        var dieMatches = [...dicetext.matchAll(reDice)];
        console.log(`found ${dieMatches.length} dice group(s) in string: ${dieMatches}`);
        for (var i in dieMatches){
            var parsedDie = parseDie(dieMatches[i][0]); //WARNING: make sure this is safe
            console.log(`Parsed die: ${parsedDie}`);
            parsedData.dice = parsedData.dice.concat(parsedDie);
        }

        // get modifiers, any format any size
        var reModifiers = /[-+]\d+(?!\w)/g; //ex: [+100, -100]
        var modifierMatches = [...dicetext.matchAll(reModifiers)];
        console.log(`found ${modifierMatches.length} modifier group(s) in string: ${modifierMatches}`);
        for(var i in modifierMatches){
            var parsedMod = parseDieModifier(modifierMatches[i][0]);
            parsedData.modifiers = parsedData.modifiers.concat(parsedMod);
        }

        return parsedData;
    }

    function createParsedDiceMessage(dice, modifiers){
        var dicemsg = '';
        var modifiersmsg = '';

        for(var i in dice){
            dicemsg += 'd' + dice[i] + ', ';
        }

        //cut of last ', ' and replace it with )
        dicemsg = dicemsg.slice(0, dicemsg.length-2);

        for(var i in modifiers){
            let sign = '';
            if(modifiers[i] >= 0) sign = '+';
            modifiersmsg += sign + modifiers[i] + '';
        }

        return `Dice: (${dicemsg}), Modifiers: (${modifiersmsg})`;
    }

    divClientDiceText.onkeyup = function(){
        // handle change events
        var dicetext=  divClientDiceText.value.replace(/\s/, '');
        var parsedData = parseDiceString(dicetext);
        divClientDiceTextParsePreview.innerHTML = createParsedDiceMessage(parsedData.dice, parsedData.modifiers);
        
        
    }

    var fn_handleconsolecommand = function(command){

        if(command === 'cls'){

            //var cmd = 'cls';
            socket.emit('consoleCommand', {cmd:'cls'});

            divClientDiceText.value = '';
            return;
        }

        if(command.includes('col')){
            let colorval = command.slice(4, command.length);
            socket.emit('consoleCommand', {cmd:'col',args:colorval});
            divClientDiceText.value = '';
            return;
        }

        divClientDiceText.value = '';
    }

    var lastRoll = Date.now();
    var DICEREROLLTIME = 250;
    var fn_rolldice = function(){

        // regex the diceroll input form
        // handle change events
        var dicetext=  divClientDiceText.value.replace(/\s/, '');

        if(dicetext === '') return;

        // prevent rerolling
        let dTime = Date.now() - lastRoll;
        if(dTime < DICEREROLLTIME){
            console.log(`Rolling not allowed for another ${DICEREROLLTIME - dTime}.`);
            return; // do nothing  
        } 

        lastRoll = Date.now();
        
        var parsedData = parseDiceString(dicetext);
        console.log('rolling dice');
        socket.emit('rollDice', parsedData);
        
        

        // clear field after roll
        var el = document.getElementById('divOptions-clearAfterRoll');
        if(el.checked) divClientDiceText.value = "";
    }



    divClientDiceRollForm.onsubmit = function(e){
        e.preventDefault(); // IMPORTANT, this prevents HTML from refreshing the page.        
        console.log("onsubmit");
        var dicetext=  divClientDiceText.value;

        if(dicetext !== ''){
            if(dicetext[0] === '/'){
                    fn_handleconsolecommand( dicetext.slice(1, dicetext.length));
            }
            else{
                fn_rolldice();
            }
            
        }
        
        
    }

    // divClientRoll.onclick = function(){
    //     console.log("onclick");
    //     fn_rolldice();
    // }

    // update player list field
    socket.on('setPlayerList', function(data){
        divClientPlayerlist.innerHTML = '';

        for(var i in data){
            var username = data[i].username;
            var color = data[i].color;
            let imgname = `./img/${username}.png`

            // todo: create stump HTML file for this
            let htmlcode = '<div class="media">';
            htmlcode    += '<a class="pull-left" href="#">';
            htmlcode    += `<img class="media-object" src= ${imgname} width=40>`;
            htmlcode    += '</a>';
            htmlcode    += '<div class="media-body">';
            htmlcode    += `<h4 class="media-heading" style="color:${color};">${username}</h4>`;
            htmlcode    += '</div>';
            
            
            

            // divClientPlayerlist.innerHTML += '<div style="color:' +color+  ';">' + username + '</div>';
            divClientPlayerlist.innerHTML += htmlcode;
        }
    });

    socket.on('addDiceRollResult', function(data){
        // add dice result on top of tray
        // currently server decides HTML coding
        divClientRollResults.innerHTML = data.html + divClientRollResults.innerHTML;

        // play sounds
        if(divOptionsPlayAudio.checked){
        var sfxfile = "diceroll_";
        console.log('rolled dice: ' + data.numDice);
        if(data.numDice == 1) sfxfile += '1_' + Math.floor((Math.random()*3)+1).toString();
        else if (data.numDice>1) sfxfile += '4_' + Math.floor((Math.random()*2)+1).toString();

        if( data.critData.didCrit){
            if(data.critData.critType === 'HIT') sfxfile = 'tada';
            if(data.critData.critType === 'MISS') sfxfile = 'oof';
            
        }
        

        console.log('playing sfx ' + sfxfile);
        var audio = new Audio('/audio/'+ sfxfile + '.mp3');   
        audio.play();
        }
     

    });

    socket.on('transferDiceLog', function(data){

        console.log('Receiving dicelog' + data.log);
        divClientRollResults.innerHTML = data.log;
    });

    