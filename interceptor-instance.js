/**

	Interceptor 0.2 - intercept function calls by overwriting the target function's apply and call method.
*/

(function(global, module){
	var registry = {};
	var interceptorList = [];
	/** Function constants */
	var SKIP = function(){ return "Skips the target function. "};
	var NOSKIP = function(){ return "Continue to run target function. "};
	/* 	1. before all functions call.
		2. after all function call.
		3. before one function call.
		4. after one function call.
		5. customized matcher.
			* before
			* after

		Interceptors should be 'chainable'
	*/
	var Interceptor = function(matcherFunc){
		matcherFunc = matcherFunc || function(){ return false ;};
		this.matcher = new Matcher(matcherFunc);
		this.runtimeState = undefined;
	};

	var RuntimeState = Interceptor.RuntimeState = function(){
		this.returnVal = undefined ;
		this.skipTarget = false ;
		this.chainedInterceptors = [];
	};

	RuntimeState.prototype ={
		finalize: function(){
			for(var i in this.chainedInterceptors){
				this.chainedInterceptors[i].releaseRuntimeState() ;
			}
			this.chainedInterceptors = [];
		},
		chainInterceptor: function(interceptor){
			this.chainedInterceptors.push(interceptor) ;
		}
	};

	Interceptor.prototype = {
		constructor: Interceptor,
		interceptPreCall: function(thisArg, targetFunc, argList){
			/* this points to the Interceptor object */
			/**
				Return this.SKIP to skip the invocation of the target function.
				This will also skip all the interceptors chained after this.
				Returning undefined is the same as returning this.NOSKIP and will 
				continue to run the target function.
			*/
		},
		interceptPostCall: function(thisArg, targetFunc, argList, returnVal){
			/* this points to the Interceptor object */
			/**
				
			*/
			return returnVal ;
		},
		attachRuntimeState: function(runtimeState){
			this.runtimeState = runtimeState;
			runtimeState.chainInterceptor(this);
		},
		releaseRuntimeState: function(){
			this.runtimeState = undefined ;
		},
		/** Skip the target function and return returnVal */
		doReturn: function(returnVal){
			this.runtimeState.returnVal = returnVal ;
			this.runtimeState.skipTarget = true ;
		},

		doSkip: function(){
			this.runtimeState.skipTarget = true ;
		}

	};

	/** Matcher constructor */
	var Matcher = Interceptor.Matcher = function(evalFunc){
		if(evalFunc){
			this.evaluate = evalFunc;
		}
	};

	Matcher.prototype = {
		evaluate: function(thisArg, targetFunc, argList){

		}
	};

	/**
		Finds all the interceptors that match the current target function and run their interceptPreCall() function.
		@returns {Interceptor.RuntimeState} Whether continue the invocation of the target function. 
	*/
	var doInterceptPreCall = function(thisArg, targetFunc, argList, runtimeState, interceptor){

		//var interceptor //= interceptorList[i];
		interceptor.attachRuntimeState(runtimeState);
		interceptor.interceptPreCall(thisArg, targetFunc, argList);
		
	};	

	/**
		Finds all the interceptors that match the current target function and run their interceptPostCall() function one by one.
		@returns {Object} an object that overwrites the return value of the target function.
	*/
	var doInterceptPostCall = function(thisArg, targetFunc, argList, returnVal){
		for(var i in interceptorList){
			var interceptor = interceptorList[i];
			var passed = false;
			try{
				interceptor.matcher.evaluate(thisArg, targetFunc, argList);
			}catch(e){
				//warn e
				//TODO
				console.error(e);
			}

			// manipulates returnVal
			if(passed){
				returnVal = interceptor.interceptPostCall(thisArg, targetFunc, argList, returnVal);
			}
		}
		return returnVal ;
	};	

	/** 
	 *	Overwrites Function.prototype.call()
	 */
	var _call = Function.prototype.call ;
	var _apply = Function.prototype.apply ;
	var _bind = Function.prototype.bind ;
	_bind.apply = _apply ;

	/** Returns a wrapped call function that is already intercepted by the interceptor */
	var callFactory = function(_call, interceptor){
		return function call(arg){
			var thisArg = arguments[0];
			var argList = argsToArray(arguments) ;
			// if (argList.length > 1){
			// 	argList.shift();
			// }
			var runtimeState = new RuntimeState();
			//interceptPreCall
			doInterceptPreCall(thisArg, this, argList, runtimeState, interceptor);

			if(!runtimeState.skipTarget){
				// call the function.
				runtimeState.returnVal = (_apply.bind(this))(thisArg, argList);
				// runtimeState.returnVal = _call.apply(this, argList);
			}

			//interceptPostCall
			// ret = doInterceptPostCall(thisArg, this, argList, ret);
			// run
			return runtimeState.returnVal ;
		};
	};

	/** Returns a wrapped apply function that is already intercepted by the interceptor */
	var applyFactory = function(_apply, interceptor){
		return function apply(){
			var thisArg = arguments[0];
			var argList;
			switch(arguments.length){
				case 0:
				case 1:
					argList = [];			
					break;
				case 2:
				default:
				argList = arguments[1];	
				
			}

			var runtimeState = new RuntimeState();
			//interceptPreCall
			doInterceptPreCall(thisArg, this, argList, runtimeState, interceptor);

			if(!runtimeState.skipTarget){
				// call the function.
				runtimeState.returnVal = (_apply.bind(this))(thisArg, argList);
				// runtimeState.returnVal = _apply.call(this, thisArg, argList);//this._apply(thisARg, argList)
			}

			//interceptPostCall
			// ret = doInterceptPostCall(thisArg, this, argList, ret);
			return runtimeState.returnVal ;
		};
	};
	Interceptor.start = function(){
		

		Function.prototype.call = function(){
			var thisArg = arguments[0];
			var argList = argsToArray(arguments) ;
			if (argList.length > 1){
				argList.shift();
			}
			var runtimeState = new RuntimeState();
			//interceptPreCall
			doInterceptPreCall(thisArg, this, argList, runtimeState);

			if(!runtimeState.skipTarget){
				// call the function.
				runtimeState.returnVal = (_apply.bind(this))(thisArg, argList);
			}

			//interceptPostCall
			// ret = doInterceptPostCall(thisArg, this, argList, ret);
			// run
			return runtimeState.returnVal ;
		};

			
		Function.prototype.apply = function(){
			var thisArg = arguments[0];
			var argList;
			switch(arguments.length){
				case 0:
				case 1:
					argList = [];			
					break;
				case 2:
				default:
				argList = arguments[1];	
				
			}

			var runtimeState = new RuntimeState();
			//interceptPreCall
			doInterceptPreCall(thisArg, this, argList, runtimeState);

			if(!runtimeState.skipTarget){
				// call the function.
				runtimeState.returnVal = (_apply.bind(this))(thisArg, argList);
			}

			//interceptPostCall
			// ret = doInterceptPostCall(thisArg, this, argList, ret);
			return runtimeState.returnVal ;
		};

	};

	Interceptor.end = function(){
		// Function.prototype.call = _call ;
		// Function.prototype.apply = _apply ;
	};

	Interceptor.interceptPreAll = function(interceptorFunc){
		if(interceptorFunc){
			var intcpt = new Interceptor(function(){return true ;});
			intcpt.interceptPreCall = interceptorFunc || intcpt.interceptPreCall;
			interceptorList.push(intcpt);
		}
	}

	Interceptor.intercept= function(targetFunc, preFunc, postFunc){
		if(typeof targetFunc !== "function"){
			throw Error("No target function specified.")
		}
		if(preFunc){
			var interceptor = new Interceptor(function(thisArg, target){return target === targetFunc;});
			interceptor.interceptPreCall = preFunc || interceptor.interceptPreCall;

		}
		//TODO postFunc

		targetFunc.call = callFactory(targetFunc.call, interceptor);
		targetFunc.apply = applyFactory(targetFunc.apply, interceptor);
	}

	var argsToArray = function(args){
		var arr = [];
		if(args && args.length)
		for(var i = 0 ;i < args.length; i ++){
			arr.push(args[i]);
		}
		return arr ;
	};

	global.Interceptor= (module || {}).exports = Interceptor;

})(typeof window !== "undefined"? window: {}, typeof module !== "undefined"? module: undefined);