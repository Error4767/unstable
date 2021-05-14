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
    if (this.status === PENDING) {
      this.status = FULFILLED;
    } else {
      return;
    }
    this.result = result;
    this.onFulfilledCallbacks.forEach((cb) => {
      cb(this.result);
    });
  }
  reject(reason) {
    if (this.status === PENDING) {
      this.status = REJECTED;
    } else {
      return;
    }
    this.reason = reason;
    this.onRejectedCallbacks.forEach((cb) => {
      cb(this.reason);
    });
  }
  bindThis() {
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (result) => Promise.resolve(result);
    onRejected = typeof onRejected === "function" ? onRejected : (err) => Promise.reject(err);
    let self = this;
    let newPromise = new Promise((resolve, reject) => {
      const onFulFulledCallbackFunction = () => {
        try {
          const x = onFulfilled(self.result);
          Promise.resolvePromise(newPromise, x, resolve, reject);
        } catch (err) {
          reject(err);
        }
      };
      const onRejectedCallbackFunction = () => {
        try {
          const x = onRejected(self.reason);
          Promise.resolvePromise(newPromise, x, resolve, reject);
        } catch (err) {
          reject(err);
        }
      };
      if (self.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(self.result);
            Promise.resolvePromise(null, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      }
      if (self.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(self.reason);
            Promise.resolvePromise(null, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      }
      if (self.status === PENDING) {
        self.onFulfilledCallbacks.push(onFulFulledCallbackFunction);
        self.onRejectedCallbacks.push(onRejectedCallbackFunction);
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
      reject(new TypeError("Chaining cycle detected for promise"));
    }
    let called = false;
    if (x instanceof Promise) {
      x.then(
        (result) => {
          Promise.resolvePromise(newPromise, result, resolve, reject);
        },
        (reason) => {
          reject(reason);
        }
      );
    } else if (
      x !== null &&
      (typeof x === "object" || typeof x === "function")
    ) {
      try {
        let then = x.then;
        if (typeof x.then === "function") {
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
          );
        } else {
          if (called) {
            return;
          }
          called = true;
          resolve(x);
        }
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
}

export { Promise };
