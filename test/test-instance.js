
var test = new NUnit.Test("InterceptorJS Test Cases");

var startTime = -1, endTime = 1000;

test.before = function(){
	startTime = new Date().getTime();
};

test.after = function(){
	endTime = new Date().getTime();
	console.log("Time used: " + (endTime - startTime) + " ms.");
};

test.testNoIntercept = function(a){
	
	var obj = {};
	var func = function(){ return "func";};
	var func2 = function(){ return "func2"};
	var func3 = function(){ return "func3"};
	// Interceptor.intercept(func, function(thisArg, targetFunc, argList){
	// 	if(thisArg === obj){
	// 		this.doReturn("");
	// 	}
	// });

	// Interceptor.intercept(func3, function(thisArg, targetFunc, argList){
	// 	if(thisArg === obj){
	// 		this.doReturn("3cnuf");
	// 	}
	// });

	a.equals("func", func());

	a.equals("func", func.call());
	a.equals("func", func.apply());

	a.equals("func", func.call(obj));
	a.equals("func", func.apply(obj));

	a.equals("func2", func2());
	
	a.equals("func2", func2.call());
	a.equals("func2", func2.apply());

	a.equals("func2", func2.call(obj));
	a.equals("func2", func2.apply(obj));

	a.equals("func3", func3());
	
	a.equals("func3", func3.call());
	a.equals("func3", func3.apply());

	a.equals("func3", func3.call(obj));
	a.equals("func3", func3.apply(obj));
};

test.testInterceptPre = function(a){
	
	var obj = {};
	var func = function(){ return "func";};
	var func2 = function(){ return "func2"};
	var func3 = function(){ return "func3"};
	Interceptor.intercept(func, function(thisArg, targetFunc, argList){
		if(thisArg === obj){
			this.doReturn("");
		}
	});

	Interceptor.intercept(func3, function(thisArg, targetFunc, argList){
		if(thisArg === obj){
			this.doReturn("3cnuf");
		}
	});

	a.equals("func", func());

	a.equals("func", func.call());
	a.equals("func", func.apply());

	a.equals("", func.call(obj));
	a.equals("", func.apply(obj));

	a.equals("func2", func2());
	
	a.equals("func2", func2.call());
	a.equals("func2", func2.apply());

	a.equals("func2", func2.call(obj));
	a.equals("func2", func2.apply(obj));

	a.equals("func3", func3());
	
	a.equals("func3", func3.call());
	a.equals("func3", func3.apply());

	a.equals("3cnuf", func3.call(obj));
	a.equals("3cnuf", func3.apply(obj));

};

test.directCallTime = function(a){
	var func = function(){ return "func";};
	a.equals("func", func());
}

test.bindApplyCallTime = function(a){
	var _apply = Function.prototype.apply ;
	var func = function(){ return "func";};
	a.equals("func", (_apply.bind(func))(null, []));
};

