
var test = new NUnit.Test("InterceptorJS Test Cases");

test.testStartEnd = function(a){
	var _apply = Function.prototype.apply ;
	var _call = Function.prototype.call ;
	
	Interceptor.start();
	
	a.neq(Function.prototype.apply, _apply);
	a.neq(Function.prototype.call, _call);

	Interceptor.end();

	a.strictEqual(Function.prototype.apply, _apply);
	a.strictEqual(Function.prototype.call, _call);

};

test.testInterceptPreAll = function(a){
	Interceptor.start();
	var obj = {};
	var func = function(){ return "func";};
	Interceptor.interceptPreAll(function(thisArg, targetFunc, argList){
		if(thisArg === obj){
			this.returnValue("");
		}
	});

	a.equals("func", func());
	a.equals("func", func.call());
	a.equals("func", func.apply());

	a.equals("", func.call(obj));
	a.equals("", func.apply(obj));
};

test.afterAll = function(){
	Interceptor.end();
}