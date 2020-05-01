
function simplelogger(name, parent = null){
    
    this.enabled = true;
    this.parent = {_indent:'', enabled:true};
    if(parent) this.parent = parent;   
  
    this.name = name;
    if(name !== '') this.name += ':';

    this._indent = '';

    this._indentchar = '\t';
    
    this.isEnabled = function(){
      let parentEnabled = true;
      if(parent !== null) parentEnabled = parent.isEnabled();
      return this.enabled && parentEnabled;
    }
    
    this.log = function(msg) {
      //console.log(msg);
      if(this.isEnabled() === true){ 
        let conMsg = this.parent._indent + this._indent + this.name;
        if(typeof(msg) === 'string') conMsg += (msg);
        else conMsg += JSON.stringify(msg);
        console.log(conMsg);
      }
    }
  
    this.debug = function(msg){
      if(this.isEnabled() === true){ 
        let conMsg = this.parent._indent + this._indent+this.name;
        if(typeof(msg) === 'string') conMsg += (msg);
        else conMsg += JSON.stringify(msg);
        console.debug(conMsg);
      }
    }
  
    this.on = function(){
        this.enabled = true;
    }
    this.off = function(){
        this.enabled = false;
    }

    this.indent = function(){
        this._indent += this._indentchar;
    }
    this.unindent = function(){
      this._indent = this._indent.slice(0,this._indentchar.length); 
    }
    return this;  
  }

  