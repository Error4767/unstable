import { track, trigger } from './depend.js';

import { isRef } from './ref.js';

// 如果是ref类型，返回其value属性值，否则原值返回
function getValue(value) {
  return isRef(value) ? value.value : value;
}

// 被排除的方法，目前暂不支持捕获数组 at 方法
const excludeMethods = ["at"];
// array 方法添加迭代依赖收集器
const arrayMethodNames = Reflect.ownKeys(Array.prototype)
  .filter(key => typeof Array.prototype[key] === "function" && !excludeMethods.includes(key));

// proxy getter, transform 是转换 value 的方法
function proxyGetter(target, key, transform = v => v) {
  track(target, key);
  // 获得value
  let value = getValue(transform(Reflect.get(target, key)));
  // 获取的是受支持的数组方法
  if (Array.isArray(target) && typeof value === "function" && arrayMethodNames.includes(key)) {
    // 返回带有依赖收集的版本
    return function (...params) {
      // 迭代器依赖收集,这里是原始结构，而不是proxy
      track(target, Symbol.iterator);
      // 从this调用才可触发proxy操作拦截
      return value.apply(this, params);
    }
  }
  return value;
}

// proxy setter
function createProxySetter(transform = v => v) {
  // transform是转换设置的新数据的函数
  return function proxySetter(target, key, value) {
    const oldValue = Reflect.get(target, key);
    if (oldValue !== value) {
      const newValue = transform(value);

      // 是ref设置其value，不是ref直接设置其值
      const operationState = isRef(target[key]) ? Reflect.set(target[key], 'value', newValue) : Reflect.set(target, key, newValue);

      trigger(target, key, oldValue, newValue);
      // 触发迭代操作的 effect
      trigger(target, Symbol.iterator);
      return operationState;
    }
    return true;
  }
}

// 捕获ownKeys类操作,Object.keys等
function proxyOwnKeysHandler(target) {
  // 依赖收集
  track(target, Symbol.iterator);
  return Reflect.ownKeys(target);
}

// 删除属性handler
function proxyDeleteHandler(target, key) {
  const oldValue = target[key];
  const isDeleted = Reflect.deleteProperty(target, key);
  if (isDeleted) {
    trigger(target, key, oldValue, undefined);
    // 触发迭代操作的 effect
    trigger(target, Symbol.iterator);
  }
  return isDeleted;
}

// 适用于 in 操作符
function proxyHasHandler(target, key) {
  // 收集依赖
  track(target, key);
  // 返回 has 结果
  return Reflect.has(target, key);
}

export {
  proxyGetter,
  createProxySetter,
  proxyOwnKeysHandler,
  proxyDeleteHandler,
  proxyHasHandler,
  getValue,
}