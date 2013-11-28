
var test = new NUnit.Test("InterceptorJS Test Cases");

var startTime = -1, endTime = 1000;

test.before = function(){
	startTime = new Date().getTime();
};

test.after = function(){
	endTime = new Date().getTime();
	// console.log("Time used: " + (endTime - startTime) + " ms.");
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

	Interceptor.intercept(func3, function(thisArg, targetFunc, argList){
		this.doSkip();
	});

	a.equals("func3", func3());
	a.isNull(func3.call());
	a.isNull(func3.apply());

};

test.testInterceptPost = function(a){
	
	var obj = {};
	var func = function(){ return "func";};
	var func2 = function(){ return "func2"};
	var func3 = function(){ return "func3"};

	Interceptor.intercept(func, null, function(thisArg, targetFunc, argList, ret){
		if(thisArg === obj){
			this.doReturn("");
		}
	});

	Interceptor.intercept(func3, null,  function(thisArg, targetFunc, argList, ret){
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

	Interceptor.intercept(func3, null,  function(thisArg, targetFunc, argList, ret){
		
		this.doReturn(ret + " post intercept");
	});
	a.equals("func3", func3());
	a.equals("3cnuf post intercept", func3.call(obj));
	a.equals("3cnuf post intercept", func3.apply(obj));

};

test.filterExample = function(a){
	var square = function(x){ return x * x ;};
	var obj = {};
	// a.exception(function(){
	// 	square();
	// });
	a.eq(NaN, square.call());
	a.eq(4, square.call(null, 2));

	Interceptor.intercept(square, function(thisArg, targetFunc, argList){
		if(typeof argList[0] !== "number"){
			this.doReturn(undefined);
		}
	});

	a.eq(undefined, square.call());
	a.eq(4, square.call(null, 2));

	Interceptor.intercept(square, null,  function(thisArg, targetFunc, argList, ret){
		if(typeof ret !== "number"){
			this.doReturn(0);
		}
	});

	a.eq(0, square.call());
	a.eq(4, square.call(null, 2));
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


test.testMethodInvocation = function(a){
	var obj = {
		func: function(){
			return "func"
		}
	};

	var func = obj.func ;

	Interceptor.intercept(func, function(thisArg, targetFunc, argList){
		if(thisArg === obj){
			this.doReturn("");
		}
	});
	// method invocation is the same as directly call
	a.eq("func", obj.func())


}

test.testContructorInvocation = function(a){
	var func = function(){ return "func";};
	a.eq({}, new func())
}

test.functionPrototypeCall = function(a){
	var func = function(){ return "func";};
	a.eq("func", func())

	Interceptor.intercept(func, function(thisArg, targetFunc, argList){

		this.doReturn("");
		
	});
	//TODO fix these cases
	// a.eq("", Function.prototype.call.apply(func, null));
	// a.eq("", Function.prototype.apply.apply(func, null));
}

test.interceptTwice = function(a){

	var obj = {};
	var func = function(){ return "func";};
	a.eq("func", func())
	a.eq("func", func.call(obj));

	Interceptor.intercept(func, function(thisArg, targetFunc, argList){
		this.doReturn("intercept 1");
	});

	a.eq("intercept 1", func.call());
	a.eq("intercept 1", func.apply());
	a.eq("func", func())

	Interceptor.intercept(func, function(thisArg, targetFunc, argList){
		if(argList[0] == 1) this.doReturn("intercept 2");
	});

	a.eq("intercept 1", func.call(obj));
	a.eq("intercept 1", func.apply(obj));

	a.eq("intercept 2", func.call(null, 1));
	a.eq("intercept 2", func.apply(null, [1]));

}


test.testBind = function(a){
	"use strict";
	var func = function(){return this.name};
	var obj = {name: "obj"};
	var func2 = func.bind(obj);

	a.exception(function(){
		func.call();
	});

	a.eq("obj", func2.call());

	Interceptor.intercept(func2, function(thisArg, targetFunc, argList){
		if(thisArg == undefined)
			this.doReturn(undefined);
	});

	a.eq(undefined, func2.call());

	Interceptor.intercept(func2, null, function(thisArg, targetFunc, argList, ret){
		if(ret == undefined)
			this.doReturn("");
	});

	a.eq("", func2.call());

	Interceptor.intercept(func, function(thisArg, targetFunc, argList){
		if(thisArg == undefined)
			this.doReturn(undefined);
	});

	Interceptor.intercept(func, null, function(thisArg, targetFunc, argList, ret){
		if(ret == undefined)
			this.doReturn("");
	});

	var func3 = func.bind({});
	a.eq("", func3.call())

}

