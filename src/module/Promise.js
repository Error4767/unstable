const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class Promise {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("Promise resolver is a not function");
    }
    this.status = PENDING;
    this.result = null;
    this.reason = null;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    this.bindThis();
    // 如果出错就reject掉
    try {
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }
  resolve(result) {
    // resolve 的是一个 Promise, 尝试resolve这个
    if(result instanceof Promise) {
      Promise.resolvePromise(undefined, result, this.resolve, this.reject);
      return;
    }
    if (this.status === PENDING) {
      setTimeout(() => {
        this.result = result;
        this.status = FULFILLED;
        this.onFulfilledCallbacks.forEach((cb) => {
          cb(this.result);
        });
      });
    }
  }
  reject(reason) {
    if (this.status === PENDING) {
      setTimeout(() => {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((cb) => {
          cb(this.reason);
        });
      });
    }
  }
  bindThis() {
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (result) => Promise.resolve(result);
    onRejected = typeof onRejected === "function" ? onRejected : (err) => Promise.reject(err);
    const self = this;
    const newPromise = new Promise((resolve, reject) => {
      if (self.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(self.result);
            Promise.resolvePromise(newPromise, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      }
      if (self.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(self.reason);
            Promise.resolvePromise(newPromise, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      }
      if (self.status === PENDING) {
        self.onFulfilledCallbacks.push(() => {
          try {
            const x = onFulfilled(self.result);
            Promise.resolvePromise(newPromise, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
        self.onRejectedCallbacks.push(() => {
          try {
            const x = onRejected(self.reason);
            Promise.resolvePromise(newPromise, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      }
    });
    return newPromise;
  }
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
  finally(callback) {
    // 遵循标准,finally无参数
    this.then(
      () => callback(),
      () => callback()
    );
  }
  static resolvePromise(newPromise, x, resolve, reject) {
    if (newPromise === x) {
      return reject(new TypeError("Chaining cycle detected for promise"));
    }
    if (x instanceof Promise) {
      if (x.status === PENDING) {
        x.then(y => {
          Promise.resolvePromise(newPromise, y, resolve, reject)
        }, reject);
      } else if (x.status === FULFILLED) {
        resolve(x.result);
      } else if (x.status === REJECTED) {
        reject(x.reason);
      }
    } else if (
      x !== null &&
      (typeof x === "object" || typeof x === "function")
    ) {
      let then;
      try {
        then = x.then;
      } catch (err) {
        reject(err);
      }

      if (typeof then === "function") {
        let called = false;
        try {
          then.call(
            x,
            (result) => {
              if (called) {
                return;
              }
              called = true;
              Promise.resolvePromise(newPromise, result, resolve, reject);
            },
            (reason) => {
              if (called) {
                return;
              }
              called = true;
              reject(reason);
            }
          )
        } catch (err) {
          if (called) {
            return;
          }
          called = true;
          reject(err);
        }
      } else {
        resolve(x);
      }
    } else {
      resolve(x);
    }
  }
  static resolve(val) {
    if (val instanceof Promise) {
      return val;
    }
    return new Promise((resolve) => {
      resolve(val);
    });
  }
  static reject(val) {
    return new Promise((_, reject) => {
      reject(val);
    });
  }
  static all(promises) {
    return new Promise((resolve, reject) => {
      // 记录成功的promise数量
      let fulfilledPromiseNumber = 0;
      // 记录成功的promise结果
      let fulfilledResults = [];
      promises.forEach((promise, i) =>
        promise.then((result) => {
          fulfilledPromiseNumber++;
          fulfilledResults[i] = result;
          if (fulfilledPromiseNumber === promises.length) {
            resolve(fulfilledResults);
          }
        }, reject)
      );
    });
  }
  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((promise) => promise.then(resolve, reject));
    });
  }
  static allSettled(promises) {
    return new Promise((resolve) => {
      // 记录结束的promise数量
      let endPromiseNumber = 0;
      // 记录promise结果
      let endResults = [];
      promises.forEach((promise, i) => {
        promise.then(
          (result) => {
            endPromiseNumber++;
            endResults[i] = {
              status: FULFILLED,
              value: result,
            };
            if (endPromiseNumber === promises.length) {
              resolve(endResults);
            }
          },
          (reason) => {
            endPromiseNumber++;
            endResults[i] = {
              status: REJECTED,
              reason: reason,
            };
            if (endPromiseNumber === promises.length) {
              resolve(endResults);
            }
          }
        );
      });
    });
  }
  static any(promises) {
    return new Promise((resolve, reject) => {
      // 记录失败的promise数量
      let rejectedPromiseNumber = 0;
      // 记录失败的promise结果
      let rejectedResults = [];
      promises.forEach((promise, i) =>
        promise.then(resolve, (reason) => {
          rejectedPromiseNumber++;
          rejectedResults[i] = reason;
          if (rejectedPromiseNumber === promises.length) {
            const errorInfo = "All promises were rejected";
            // 根据标准将多个错误封装在一个错误中
            const aggregateError = new AggregateError(
              rejectedResults,
              errorInfo
            );
            // 手动设置stack信息，与标准保持同步
            aggregateError.stack = "AggregateError: " + errorInfo;
            reject(aggregateError);
          }
        })
      );
    });
  }
  static withResolvers() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return {
      promise,
      resolve,
      reject,
    };
  }
  static try(func) {
    return new this((resolve, reject) => {
      try {
        resolve(func());
      } catch (error) {
        reject(error);
      }
    });
  };
}

export { Promise };