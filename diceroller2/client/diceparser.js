
class DicePool{
    constructor(){
        this.logger= new simplelogger('DicePool');
        this.pool = {};
        logger.off();
    }

    parseDieString(diestring){
        var logger = new simplelogger('parseDieString', logger);
        logger.indent();
        logger.off();
        logger.debug("parsing die " + diestring);
        let fnResult = {data:'',succes:true,msg:''};

        let result = [];
        // let sign = 1; // 1  / -1
        let multiplier = 1;
        let dieSides = 0;

        // function is composed of 2 parts, 
        // first: decompose the input diestring
        // second: construct a list of dice

        // 1. check if die is empty , fail and return
        if( !diestring || diestring ===''){
            fnResult.succes = false;
            fnResult.msg = `parseDieString expected "dicestring", got ${diestring}`;
            return fnResult;
        }
        if( /[-*\/]/.test(diestring)){
            fnResult.succes = false;
            fnResult.msg = `Die cannot be 0", got ${diestring}`;
            return fnResult;
        }

        // 2. try and get the multiplier (the part before the 'd' is there is any). 
        let rx_dicecount = /\d*(?=d)/i;
        let diceCountList = rx_dicecount.exec(diestring);
        if(diceCountList === null){
          fnResult.succes = false;
          fnResult.msg = `failed getting dicecount for object ${diestring}`;
          return fnResult;
        }

        let diceCount = rx_dicecount.exec(diestring)[0];
        if( diceCount !== '' ) multiplier = parseInt(diceCount);
        if(multiplier === 0){
          fnResult.succes = false;
          fnResult.msg = 'die count cannot be 0';
          return fnResult;
        }

        // 3. try and get the sides count of the die, everything behind the 'd'
        let rx_dicesides = /\d*$/; //any digit at the end of the string is considered a SidesCount
        let diceval = rx_dicesides.exec(diestring)[0];
        if( diceval === '' || diceval === null){
            fnResult.succes = false;
            fnResult.msg = `could not parse dicesides from dicestring ${diestring}`;
            return fnResult;
        }                    
        dieSides = parseInt(diceval);     
        logger.debug(`Parsed data: ${multiplier} * d${dieSides}`);
        // create list of dice
        let dieData = [];
        for( let i = 0; i < multiplier; i++){
          dieData.push(dieSides);
        }

        logger.unindent();
        return {data:dieData,
                succes:fnResult.succes,
                msg:fnResult.msg
                };

    }
    AddDie(diestring){
        /// how can I be sure I get a diestring and not a list of numbers??
        let parseResult = this.parseDieString(diestring);
        if(parseResult.succes === false){
            console.warn('AddDie: ' + parseResult.msg );
            return {succes:false, msg:parseResult.msg};
        }
        let dieType = parseResult.data[0];

        if(this.pool[dieType]){
            this.pool[dieType] = this.pool[dieType].concat(parseResult.data);
            }
        else this.pool[dieType] = parseResult.data;

        return {succes:true, msg:''};

    }
    RemoveDie(diestring){
        let parseResult = this.parseDieString(diestring);
        if(parseResult.succes === false){
            console.warn('RemoveDie: ' + parseResult.msg );
            return {succes:false, msg:parseResult.msg};
        }
        
        let dieType = parseResult.data[0];

        if(this.pool[dieType]){
            let _numItemsInPool = this.pool[dieType].length;
            let _numItemsToRemove = parseResult.data.length;
            _numItemsToRemove = Math.min(_numItemsInPool , _numItemsToRemove);
            this.pool[dieType].length = _numItemsInPool - _numItemsToRemove;
            
            }
        else{logger.log('RemoveDie: trying to remove die that is not in pool: ' + diestring);}

        return{succes:true, msg:''};
    }

    parseDiceString(dicestring){
        // example input string
        var logger = new simplelogger('ParseDiceString', logger);
        logger.off();
        logger.indent();
        logger.log('Parsing string: ' + dicestring);
        
        

        let fnResult = {dicepool:null, skipped:null, succes:true, msg:''}
         

        // regex to find everything that is conceivably a die, what doesn't match is considered a modifier or wrong,
        // these are added to the 'skipped' list
        let  rx_dice = /[-+]?\d*[dD]\d*/ig; //ex: [1d20, +1d20,-1d20, +d20, 1D120]
        fnResult.skipped = dicestring.replace(rx_dice, '');
        let r;
        let newDP = new DicePool();
        while( (r = rx_dice.exec(dicestring)) !== null){
            let diestring = r[0];
            let pRes = this.parseDieString(diestring);
            if(pRes.succes === false){
                logger.log(diestring + ' is invalid');
                fnResult.skipped += diestring;
            }
            else{
                
                newDP.AddDie(diestring);
                //logger.log(pRes);
                

            }
        }
        //logger.log(rx_dicematches);
        
            
        fnResult.dicepool = newDP.pool;

        logger.log('FunctionResult: ' + JSON.stringify(fnResult));
        return fnResult;

    }

    setPool(newpool){
        this.pool = newpool;
    }

    flatten(){
        let keys = Object.keys( this.pool) ;
        console.log('keys: ' +  keys);
        let flatlist = [];
        for(let k in keys){
            let key = keys[k];
            flatlist = flatlist.concat( this.pool[key] );
        }
        return flatlist;
    }

}


class ModifierPool{
    constructor(){
        this.pool = [];
    }
    parseModSegment(modstring){
        let fnResult= {data:'', succes:true, msg:''};

        let sign = 1;
        let modifier = 0;
        
        // get modifier sign (-/+), check if there is a -, otherwise default to +
        var modifierMatches = /[-+]/.exec(modstring);
        if(modifierMatches){
            if( /-/.test(modstring) ) sign = -1;
        }
        let modifierval = modstring.replace(/[-+]/, '');
        modifier = parseInt(modifierval);

        let result = modifier * sign;
        
        fnResult.data = result;
        return fnResult;
    }

    parseModString(modstring){    
        let fnResult = {modifiers:[],skipped:'', msg:''}        
        let rx_modifiers = /[-+]\d+(?!\w)/g; //ex: [+100, -100]
        let rx_modifiersMatches = [...modstring.matchAll(rx_modifiers)];
        for (let i in rx_modifiersMatches){
            let modString = rx_modifiersMatches[i][0];
            
            let parsedData = this.parseModSegment(modString);
            //this.pool.push(parsedData);
            if(parsedData.succes === false){
                logger.log('could not parse segment ' + modstring);
                fnResult.skipped += parsedData.data;
                fnResult.msg += 'Failed to parse segment '+ modstring;
                return fnResult;
            }
            
            fnResult.modifiers.push(parsedData.data);
        }

        // create a list of NON-matches by replacing everything that DID match with an empty space
        let skippedData = modstring.replace(rx_modifiers, '');
        fnResult.skipped = skippedData;
        return fnResult;
    }

    setPool(newpool){
        this.pool = newpool;
    }
    
    getPool(){return this.pool;}
}
