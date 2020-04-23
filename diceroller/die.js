// create dice class here:
// required: sides
// required: result


//import * as GUID from guid.js;

export class  die{
    constructor(sides, result =  -1){
        self.sides = sides;
        self.result = result;
        self.guid = GUID._createguid();

    }

    roll() {
        console.log("Die rolled with GUID: ${guid}");

        
    }

    // _createguid(){
    //     var sGuid = "";
    //     for (var i = 0; i< 32; i++)
    //     {
    //         sGuid += Math.floor(Math.random() * 0xF).toString(0xF);
    //     }
    //     return sGuid;
    // }
    
}

