export class Promise{
	constructor(executor){
		if(typeof executor!=='function'){
			throw new TypeError('Promise resolver is a not function');
		}
		this.status = 'pending';
		this.result = null;
		this.reason = null;
		this.onFulfilledCallbacks = [];
		this.onRejectedCallbacks = [];
		this.bindThis();
		executor(this.resolve,this.reject);
	}
	resolve(result){
		if(this.status === 'pending'){
			this.status = 'fulfilled';
		}else{
			return;
		}
		this.result = result;
		this.onFulfilledCallbacks.forEach((cb)=>{
			cb(this.result);
		})
	}
	reject(reason){
		if(this.status === 'pending'){
			this.status = 'rejected';
		}else{
			return;
		}
		this.reason = reason;
		this.onRejectedCallbacks.forEach((cb)=>{
			cb(this.reason);
		})
	}
	bindThis(){
		this.resolve = this.resolve.bind(this);
		this.reject = this.reject.bind(this);
	}
	then(onFulfilled,onRejected){
		let	hasOnRejected;
		if(typeof onFulfilled !== 'function'){
			throw new TypeError('Promise resolver is a not function');
		}
		if(typeof onRejected ==='function'){
			hasOnRejected = true;
		}else {
			hasOnRejected = false;
		}
		let self = this;
		let newPromise = new Promise((resolve,reject)=>{
			let onFulFulledCallbackFunction = ()=> {
				try{
					const x = onFulfilled(self.result);
					Promise.resolvePromise(newPromise,x,resolve,reject);
				}catch(err){
					reject(err);
				}
			}
			let onRejectedCallbackFunction = ()=> {
				try{
					const x = onRejected(self.reason);
					Promise.resolvePromise(newPromise,x,resolve,reject);
				}catch(err){
					reject(err);
				}
			}
			if(self.status === 'fulfilled'){
				self.onFulfilledCallbacks.isExecuted = true;
				try{
					const x = onFulfilled(self.result);
					Promise.resolvePromise(null,x,resolve,reject);
				}catch(err){
					reject(err);
				}
			}
			if(self.status === 'rejected' && hasOnRejected){
				self.onRejectedCallbacks.isExecuted = true;
				try{
					const x = onRejected(self.reason);
					Promise.resolvePromise(null,x,resolve,reject);
				}catch(err){
					reject(err);
				}
			}
			if(self.status === 'pending'){
				self.onFulfilledCallbacks.push(onFulFulledCallbackFunction);
				self.onFulfilledCallbacks.isExecuted = true;
				if(hasOnRejected) {
					self.onRejectedCallbacks.push(onRejectedCallbackFunction);
					self.onRejectedCallbacks.isExecuted = true;
				}
			}
		});
		newPromise.prevPromise = self;
		return newPromise;
	}
	catch(onRejected) {
		let self = this.prevPromise;
		if(!self.onRejectedCallbacks.isExecuted) {
			let onRejectedFunction = ()=> {
				try{
					const x = onRejected(self.reason);
					Promise.resolvePromise(this, x, this.resolve, this.reject);
				}catch (err){
					this.reject(err);
				}
			}
			if(self.status === 'rejected') {
				onRejectedFunction();
			}
			if(self.status === 'pending') {
				self.onRejectedCallbacks.push(onRejectedFunction);
			}
		}
		return this;
	}
	finally(callback){
		this.onFulfilledCallbacks.push(callback);
		this.onRejectedCallbacks.push(callback);
		return this;
	}
	static resolvePromise(newPromise,x,resolve,reject){
		let self = this;
		if(newPromise === x){
			reject(new TypeError('Chaining cycle detected for promise'));
		}
		let called = false;
		if(x instanceof Promise){
			x.then(result=>{
				Promise.resolvePromise(newPromise,result,resolve,reject);
			},reason=>{
				reject(reason);
			})
		}else if(x !== null && (typeof x === 'object' || typeof x === 'function')){
			try{
				let then = x.then;
				if(typeof x.then === 'function'){
					then.call(x,
					result=>{
						if(called){return};
						called = true;
						Promise.resolvePromise(newPromise,result,resolve,reject);
					},
					reason=>{
						if(called){return};
						called = true;
						reject(reason);
					});
				}else{
					if(called){return};
					called = true;
					resolve(x);
				}
			}catch(err){
				if(called){return};
				called = true;
				reject(err);
			}
		}else{
			resolve(x);
		}
	}
	static resolve = function(val){
		if(val instanceof Promise){
			return val;
		}
		return new Promise((resolve,reject)=>{
			resolve(val);
		});
	}
	static reject = function(val){
		if(val instanceof Promise){
			return val;
		}
		return new Promise((resolve,reject)=>{
			reject(val);
		});
	}
	static all = function(promiseArr){
		return new Promise((resolve,reject)=>{
			let theFirstReason = null;
			let resultArr = [];
			promiseArr.forEach((promise,index)=>{
				promise.index = index;
				promise.onFulfilledCallbacks.push(()=>{
					let allResolved = true;
					let excuting = false;
					promiseArr.forEach((promise)=>{
						if(promise.status === 'rejected'){
							allResolved = false;
							theFirstReason = promise.reason;
							reject(theFirstReason);
							return false;
						}else if(promise.status === 'pending'){
							excuting = true;
						}else{
							resultArr[promise.index] = promise.result;
						}
					})
					if(allResolved === true && excuting === false){
						resolve(resultArr);
					}
				});
			})
		})
	}
	static race = function(promiseArr){
		return new Promise((resolve,reject)=>{
			let executed = false;
			promiseArr.forEach((promise,index)=>{
				promise.onFulfilledCallbacks.push(()=>{
					if(!executed){
						if(promise.result !== null){
							resolve(promise.result);
							executed = true;
						}
						if(promise.reason !== null){
							reject(promise.reason);
							executed = true;
						}
					}
				});
			})
		})
	}
	static allSettled = function(promiseArr){
		return new Promise((resolve,reject)=>{
			let theFirstReason = null;
			let resultArr = [];
			promiseArr.forEach((promise,index)=>{
				promise.index = index;
				promise.onFulfilledCallbacks.push(()=>{
					let excuting = false;
					promiseArr.forEach((promise)=>{
						if(promise.status === 'pending'){
							excuting = true;
						}else if(promise.status === 'rejected'){
							resultArr[promise.index] = {
								status:promise.status,
								value:promise.reason
							}
						}else if(promise.status === 'fulfilled'){
							resultArr[promise.index] = {
								status:promise.status,
								value:promise.result
							}
						}
					})
					if(excuting === false){
						resolve(resultArr);
					}
				});
			})
		})
	}
}