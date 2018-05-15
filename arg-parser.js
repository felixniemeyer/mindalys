module.exports = {
	parse: function(argv, argSpecs){
		var args = {};
		for(key in argSpecs){
			var argSpec = argSpecs[key];
			args[argSpec.name] = argSpec.defaultValue;
		}
		for(var storeNextIn, i = 0; i < argv.length; i++) {
			var arg = argv[i];
			if(storeNextIn != undefined){
				args[storeNextIn] = arg;
				storeNextIn = undefined; 
			} else {	
				var argSpec = argSpecs[arg];
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
	}
};
