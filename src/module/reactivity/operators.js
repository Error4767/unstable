import { track, trigger, defaultDepend, getMap, operateEffects } from './depend.js';

import { isRef } from './ref.js';

// 如果是ref类型，返回其value属性值，否则原值返回
function getValue(value) {
  return isRef(value) ? value.value : value;
}

// 处理array使其方法也具有反应性
function handleArray(arr, map) {
  if (arr !== Array.prototype) {
    // 设置依赖列表，便于数组操作
    if (!arr[operateEffects.effectsIdentify]) {
      operateEffects.setEffects(arr, map);
    }
  }
}

// proxy getter
function proxyGetter(target, key) {
  const { map } = track(target, key, defaultDepend);
  // 是数组则处理一下
  Array.isArray(target[key]) && handleArray(target[key], map);
  let value = getValue(Reflect.get(target, key));
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
      // 触发迭代操作的 effect, 如果有的话
      target?.[operateEffects.effectsIdentify]?.get(Symbol.iterator)?.notify();
      return operationState;
    }
    return true;
  }
}

// 捕获ownKeys类操作,Object.keys等
function proxyOwnKeysHandler(target) {
  // 依赖收集
  track(target, Symbol.iterator, defaultDepend);
  const map = getMap(target);
  if (map && !target[operateEffects.effectsIdentify]) {
    operateEffects.setEffects(target, map);
  }
  return Reflect.ownKeys(target);
}

// 删除属性handler
function proxyDeleteHandler(target, key) {
  const oldValue = target[key];
  const isDeleted = Reflect.deleteProperty(target, key);
  if (isDeleted) {
    trigger(target, key, oldValue, undefined);

    // 触发迭代操作的 effect, 如果有的话
    target?.[operateEffects.effectsIdentify]?.get(Symbol.iterator)?.notify();
  }
  return isDeleted;
}

// 适用于 in 操作符
function proxyHasHandler(target, key) {
  // 收集依赖
  track(target, key, defaultDepend);
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
  handleArray
}