/**!
 * @ignore
 * Thread | asThread
 * @author Justany_WhiteSnow
 * @mail miniflycn@justany.net
 * @homepage https://github.com/miniflycn/asThread
 * @support requireJs(AMD)、Arale|SeaJs(CMD)、mass-Framework(AMD) and any other Non-module Loader
 */
(function(root, factory) {
	if(typeof define === "function"){
		define("Thread" ,factory);	// AMD || CMD
	}else{
		root.Thread = factory;	// <script>
	}
}(this, function () {
	
'use strict'

var version = "0.5b",
	minImm = 1,
	max = 10,
	uid = 0;	
	
var expando = "Thread" + ( version + Math.random() ).replace( /\D/g, "" ),
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
	
	window.addEventListener("message", handleMessage, true);
	
}else{
	setImm = function(__fn){
		setTimeout(__fn, 0);
	}
}

function addHandler(__elem, __type, __handler){
	if(__elem.addEventListener){
		__elem.addEventListener(__type, __handler, false);
	}else{
		__elem.attachEvent("on" + __type, __handler);
	}
}

function removeHandler(__elem, __type, __handler){
	if(__elem.removeEventListener){
		__elem.removeEventListener(__type, __handler, false);
	}else{
		__elem.detachEvent("on" + __type, __handler);
	}
}

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

/**
 * 真正的Thread
 * @private
 * @class Thread
 */
__Thread.prototype = {

	constructor: Thread,
	
	/**
	* 打包工具1
	* @private
	* @type {Function}
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
	
	/**
	* 打包工具2
	* @private
	* @type {Function}
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
	
	/**
	* 停止当前线程
	*/
	stop: function(){	
		callbacks.push(this);
		this.isStop = true;
		this.fired = false;
		
		return this;
	},
	
	/**
	* 删除当前线程
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
	
	/**
	* 触发当前线程，请优先考虑使用run方法。
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
	
	/**
	 * 定义回调函数的参数。
	 * @param value1 {*} 第一个参数
	 * @param {*} [value2] 第二个参数
	 * …………
	 * @param {*} [valuen] 第n个参数
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
	
	/**
	 * 然后运行，或者延迟后在运行
	 * @param fn {Function} 要回调的函数
	 * @param {Number} [delay] 延迟时间
	 */
	then: function(__fn, __delay){
		this.callbacks.push(this.__package(__fn, __delay));
		
		return this;
	},
	
	/**
	 * 然后运行。该方法不会阻塞浏览器线程。
	 * @param fn {Function} the callback function
	 */
	imm: function(__fn){
		this.callbacks.push(this.__package2(__fn));
		
		return this;
	},
	
	/**
	 * 等待一段时间。
	 * @param delay {Number} 等待的时长
	 */
	wait: function(__delay){
		return this.then(tool_nullFun, __delay);
	},
	
	/**
	 * 启动线程。
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
	
	/**
	 * 创建Loop线程
	 * @param n {Number} 循环的次数，如果是负数，则无限循环
	 */
	loop: function(__n){
		var self = this,
			ret = new __Thread(self.name),
			isBreak = false;
		ret.index = 0;
		ret.args = [0];
		/**********************
		* 重现Loop的fire方法
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
		* 重写Loop线程的define方法，使得传参从第二个开始。
		*/
		ret.define = function(){
			var tmp = tool_slice.call(arguments)
			tmp.unshift(this.args[0]);
			this.args = tmp;
			return this;
		};
		/**********************
		* 退出Loop线程，返回主线程
		*/
		ret.loopEnd = function(){
			var that = this;
				
			self.callbacks.push(function(){that.run();});
			
			setThread(this.name, self);
			return self;
		};
		/**********************
		* 在Loop中途退出Loop。
		*/
		ret.breakOut = function(){
			isBreak = true;
		};
		return ret;
	},
	
	/**********************
	 * 创建一个Right线程
	 * @param boolean {Boolean | Function} 如果为true则启动Right线程，否则启动Left线程
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
		* 创建一个Left线程
		*/
		ret.left = function(){
			var self = this;
			/**********************
			* 退出Left线程
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
		* 退出Right线程，返回主线程
		*/
		ret.rightEnd = function(){
			
			leftObj.callbacks.push(function(){self.fire();}); 
			this.callbacks.push(function(){self.fire();});
			
			setThread(this.name, self);
			return self;
		};
		this.callbacks.push(this.__package(fn));
		
		return ret;
	},
	
	/**********************
	 * 创建分支线程On
	 */
	on: function(__elem, __type, __attach, __detach){
		var self = this,
			ret = new __Thread(this.name),
			attach = __attach || addHandler,
			detach = __attach ? (__detach || tool_nullFun) : removeHandler,
			handler = function(event){
				ret.args = [event];
				ret.run();
			};
			
		/**********************
		* 退出On分支，返回原线程
		*/
		ret.onEnd = function(){
			this.callbacks.push(function(){
				detach(__elem, __type, handler);
				self.fire();
			});
			
			setThread(this.name, self);
			return self;
		};
		
		this.callbacks.push(function(){attach(__elem, __type, handler)});
		
		return ret;
	}
};

cache[expando] = new __Thread(expando);

/**
 * 获取或创建一个Thread
 * @param {String | Number} [name] 没有名字则是返回默认线程，否则通过名字获取或创建
 */
function Thread(__name){
	if(length >= max){
		throw "Too much Threads to be created!"
	}
	return !__name ? cache[expando] : 
			cache[__name] ? cache[__name] : 
			(new __Thread(__name));
}

return Thread;

})());