(function(host){
	
'use strict'

var version = "0.4",
	minImm = 1,
	max = 10,
	uid = 0;	
	
var expando = "asThread" + ( version + Math.random() ).replace( /\D/g, "" ),
	cache = {},
	length = 0,
	setImm = null,
	firing = false,
	callbacks = [],
	begin = 0,
	end = 0;
	
var tool_slice = callbacks.slice,
	tool_nullFun = function(){};

/********************
 *	Hack from: David Baron
 *	http://dbaron.org/log/20100309-faster-timeouts
 */
 
if(!(setImm = msSetImmediate) && window.postMessage){
	var msSetImmediate,
		timeouts = [],
		messageName = expando + "-message",
	handleMessage = function(__event){
		if (__event.source === window && __event.data == messageName) {
			__event.stopPropagation();
			if (timeouts.length > 0) {
				var __fn = timeouts.shift();
				__fn();
			}
		}
	};
	setImm = function (__fn) {
		timeouts.push(__fn);
		window.postMessage(messageName, "*");
	};
}else{
	setImm = function(__fn){
		setTimeout(__fn, 0);
	}
}

window.addEventListener("message", handleMessage, true);

function setThread(__name, __Thread){
	cache[__name] = __Thread;
}

function __Thread(__name){
	if(__name){
		this.name = __name;
		if(!cache[__name]){
			length++;
		}
		cache[__name] = this;
	}
	this.args = undefined;
	this.returnVal = undefined;
	this.callbacks = [];
	this.self = this;
	this.fired = false;
	this.isStop = false;
	this.uid = uid++;
}
__Thread.prototype = {

	constructor: Thread,
	
	/**********************
	 * 打包工具1
	 */
	__package: function(__fn, __delay){
		var self = this;
		if(!__delay){
			return function(){
				var args = self.args || [],
					returnVal;
				self.returnVal ? args.push(self.returnVal) : null;
				args ? (returnVal = __fn.apply(self.self, args)) : (returnVal = __fn.apply(self.self));
				returnVal !== undefined ? self.returnVal = returnVal : null;
				
				self.isStop || self.fire();
			};
		}else{
			return function(){
				setTimeout(function(){
					var args = self.args || [],
						returnVal;
					self.returnVal ? args.push(self.returnVal) : null;
					args ? (returnVal = __fn.apply(self.self, args)) : (returnVal = __fn.apply(self.self));
					returnVal !== undefined ? self.returnVal = returnVal : null;
					
					self.isStop || self.fire();
				}, __delay);
			}
		}
	},
	
	/**********************
	 * 打包工具2
	 */
	__package2: function(__fn){
		var self = this;
		return function(){
			setImm(function(){
				var args = self.args || [];
				self.returnVal ? args.push(self.returnVal) : null;
				args ? __fn.apply(self.self, args) : __fn.apply(self.self);
					
				self.isStop || self.fire();
			});
		}
	},
	
	/**********************
	 * 阻止线程继续运行
	 */
	stop: function(){	
		callbacks.push(this);
		this.isStop = true;
		
		return this;
	},
	
	/**********************
	 * 删除线程
	 */
	del: function(){
		if(this.name = expando){
			console && console.error("You shouldn't destroy the main thread!");
		}else{
			cache[this.name] = null;
			delete cache[this.name];
			length--;
		}
	},
	
	/**********************
	 * 触发线程执行下一个打包函数
	 */
	fire: function(){
		var fn,
			ret = this;
		(fn = this.callbacks.shift()) ? fn() : (ret = false);
		
		if(!this.callbacks.length){
			this.fired = false;
		}
		
		return ret;
	},
	
	/**********************
	 * 定义所有回调函数的参数
	 */
	define: function(){
		if(!arguments.length) return;
		var args = tool_slice.call(arguments);
		for(var i = args.length; i--;){
			args[i] === undefined ? (args[i] = this.args[i]) : null;
		}
		this.args = args;
		
		return this;
	},
	
	/**********************
	 * 然后运行fn，或者然后延迟delay运行fn
	 */
	then: function(__fn, __delay){
		this.callbacks.push(this.__package(__fn, __delay));
		
		return this;
	},
	
	/**********************
	 * 保证线程不阻塞的最快运行fn的方法
	 */
	imm: function(__fn){
		this.callbacks.push(this.__package2(__fn));
		
		return this;
	},
	
	/**********************
	 * 等待__delay在运行后面步骤
	 */
	wait: function(__delay){
		return this.then(tool_nullFun, __delay);
	},
	
	/**********************
	 * 启动线程，注意和fire不相同
	 */
	run: function(){
		if(!this.fired){
			if(arguments.length){
				this.define(tool_slice.call(arguments));
			}
			this.fired = true;
			this.fire();
		}
		
		return this;
	},
	
	/**********************
	 * 创建循环线程Loop
	 */
	loop: function(__n){
		var self = this,
			ret = new __Thread(self.name),
			isBreak = false;
		ret.index = 0;
		ret.args = [0];
		/**********************
		* 重写Loop的fire方法
		*/
		ret.fire = function(){
			var fn;
			if(isBreak){
				return self.fire();
			}
			if(__n < 0){
				(fn = this.callbacks[this.index]) ? 
				(++this.index) && fn() : (this.index = 0) || this.fire();
				
				return this;
			}	
			if(fn = this.callbacks[this.index]){
				this.index++;
				fn();
			}else{
				if(++this.args[0] >= __n){
					self.fire()
				}else{
					this.index = 0;
					this.fire();
				}
			}
	
			return this;
		};
		/**********************
		* 重写Loop的define，使得定义的参数是从第二个开始的
		*/
		ret.define = function(){
			var tmp = tool_slice.call(arguments)
			tmp.unshift(this.args[0]);
			this.args = tmp;
			return this;
		};
		/**********************
		* 退出Loop返回原线程
		*/
		ret.loopEnd = function(){
			var that = this;
				
			self.callbacks.push(function(){that.run();});
			
			setThread(this.name, self);
			return self;
		};
		/**********************
		* 线程中途退出，类似于break，不过只能在该循环的回调函数中使用
		* 【Remind】 未来需要修改
		*/
		ret.breakOut = function(){
			isBreak = true;
		};
		return ret;
	},
	
	/**********************
	 * 创建分支线程Right
	 */
	right: function(__true){
		var self = this,
			ret = new __Thread(self.name),
			leftObj = new __Thread(),
			fn = function(){
			var isTrue = typeof __true === "function" ? __true.call(self, self.args) : __true;
			if(isTrue){
				self.callbacks.push(function(){ret.run();});
			}else{
				if(leftObj){
					self.callbacks.push(function(){leftObj.run();});
				}
			};
		};
		/**********************
		* 返回Left分支
		*/
		ret.left = function(){
			var self = this;
			/**********************
			* 退出Left分支，返回其Right分支
			*/
			leftObj.leftEnd = function(){
				setThread(this.name, self);
				return self;
			};
			
			leftObj.name = this.name;
			setThread(this.name, leftObj);
			return leftObj;
		};
		/**********************
		* 退出Right分支，返回原(伪)线程
		*/
		ret.rightEnd = function(){
			var ret = new __Thread(self.name),
				isFirst = true;
			/**********************
			* 修改run方法，使得其效果和原线程相似
			*/
			ret.run = function(){
				if(isFirst){
					self.run();
					isFirst = false;
				}else if(!this.fired){
					this.fire();
				}
				
				return this;
			}
			leftObj.callbacks.push(function(){ret.run();}); 
			this.callbacks.push(function(){ret.run();});
			return ret;
		};
		this.callbacks.push(this.__package(fn));
		
		return ret;
	}
};

cache[expando] = new __Thread(expando);

function Thread(__name){
	if(length >= max){
		throw "Too much Threads to be created!"
	}
	return !__name ? cache[expando] : 
			cache[__name] ? cache[__name] : 
			(new __Thread(__name));
}

host.Thread = Thread;

})(window);