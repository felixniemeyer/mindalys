module.exports = function(){ 
	var ArgParser = function(argSpecs){
		this.argSpecs = argSpecs; 
	}

	ArgParser.prototype.parse = function(argv){
		argv = argv.splice(2); 
		var args = {};
		for(key in this.argSpecs){
			var argSpec = this.argSpecs[key];
			args[argSpec.name] = argSpec.defaultValue;
		}
		for(var storeNextIn, i = 0; i < argv.length; i++) {
			var arg = argv[i];
			if(storeNextIn != undefined){
				args[storeNextIn] = arg;
				storeNextIn = undefined; 
			} else {	
				var argSpec = this.argSpecs[arg];
				if(argSpec != undefined) {
					if(argSpec.expectValue){
						storeNextIn = argSpec.name; 
					} else {
						args[argSpec.name] = true;
					}
				} else {
					console.error('Unknown argument "' + arg); 
				}
			}
		}
		return args; 
	};

	ArgParser.prototype.getManual = function(){
		var manual = []; 
		manual.push('The following options are available: '); 
		for(key in this.argSpecs){
			var argSpec = this.argSpecs[key]; 
			var argDescr = key;
			if(argSpec.expectValue){
				argDescr += " <value>";  
			}
			argDescr += ' '.repeat(argDescr.length < 20 ? 20 - argDescr.length : 0);
			argDescr += "\t"+argSpec.name; 
			if(argSpec.defaultValue){
				argDescr += ` (default = ${argSpec.defaultValue})`;
			}
			manual.push(argDescr); 
		}
		return manual.join('\n');
	};

	return ArgParser; 
};
