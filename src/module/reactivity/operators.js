import { track, trigger } from './depend.js';

import { isRef } from './ref.js';

import { mutatedArrayProto } from './protos.js';

import { getMap, operateEffects } from './depend.js';

// 如果是ref类型，返回其value属性值，否则原值返回
function getValue(value) {
  return isRef(value) ? value.value : value;
}

// 处理array使其方法也具有反应性
function handleArray(arr, map) {
  if (arr !== Array.prototype) {
    // 设置原型，使用具有变异方法的原型
    if (arr.__proto__ !== mutatedArrayProto) {
      arr.__proto__ = mutatedArrayProto;
    }
    // 设置依赖列表，便于数组原生方法操作
    if (!arr[operateEffects.effectsIdentify]) {
      operateEffects.setEffects(arr, map);
    }
  }
}

// map中根据key存放一些dep
function createProxyGetter(depend) {
  return function proxyGetter(target, key) {
    const { map } = track(target, key, depend);
    // 是数组则处理一下
    Array.isArray(target[key]) && handleArray(target[key], map);
    let value = getValue(Reflect.get(...arguments));
    return value;
  }
}

function createProxySetter(transform = v => v) {
  // transform是转换设置的新数据的函数
  return function proxySetter(target, key, value) {
    const oldValue = Reflect.get(target, key);
    if (oldValue !== value) {
      const newValue = transform(value);

      // 是ref设置其value，不是ref直接设置其值
      const operationState = isRef(target[key]) ? Reflect.set(target[key], 'value', newValue) : Reflect.set(target, key, newValue);

      trigger(target, key, oldValue, newValue);

      // 如果有依赖属性则是ownKeys操作器收集了依赖，触发effect
      target?.[operateEffects.effectsIdentify]?.forEach(dep=> dep.notify());

      return operationState;
    }
    return true;
  }
}

// 捕获ownKeys类操作,Object.keys等
function createProxyOwnKeysHandler() {
  return function proxyOwnKeysHandler(target) {
    const map = getMap(target);
    if(map && !target[operateEffects.effectsIdentify]) {
      operateEffects.setEffects(target, map);
    }
    return Reflect.ownKeys(target);
  }
}

export {
  createProxyGetter,
  createProxySetter,
  createProxyOwnKeysHandler,
  handleArray
}