d3.loadDataSet = function (option){
	var files = option["files"];
	var endFn = option["endFn"];
	var loadingStartFn = option["loadingStartFn"];
	var loadingSuccessFn = option["loadingSuccessFn"];
	
	if (!Array.isArray(files)) throw "TypeError: files is not a array!";
	if (loadingStartFn && typeof loadingStartFn != "function") throw "TypeError: loadingStartFn is not a function!";
	if (loadingSuccessFn && typeof loadingSuccessFn != "function") throw "TypeError: loadingSuccessFn is not a function!";
	if (typeof endFn != "function") throw "TypeError: endFn is not a function!";
	
	var dataStack = {};
	var fnStack = [];
	
	var chain = function(functions) {
		return functions.reduceRight(function (next, curr) {
			return function () {
				curr.apply({next: next}, arguments);
			}
		});
	}
	
	files.forEach(function(arg){
		if (loadingStartFn) loadingStartFn(arg);
		fnStack.push(
			function() {
				var that = this;
				var exte = arg.file.split(".")[arg.file.split(".").length-1];
				var readfile;
				switch(exte){
					case "json": case "geojson": case "topojson":
						readfile = d3.json;
					break;
					case "csv":
						readfile = d3.csv;
					break;
					default:
						throw "TypeError: " + exte + " is not supported";
					break;                        
				}
				
				return readfile(arg.file,  function(data){
					dataStack[arg.key] ={};
					dataStack[arg.key].data = data;
					dataStack[arg.key].option = arg;
					if (loadingSuccessFn) loadingSuccessFn({data: data, option:arg});
					that.next();
				});
			}
		)
	});
	
	fnStack.push(function(){
		endFn(dataStack);
	});
	chain(fnStack)(); 
		
}    	