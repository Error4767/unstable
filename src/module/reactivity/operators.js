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

      let length = Array.isArray(target) ? target.length : 0;
      // 是ref设置其value，不是ref直接设置其值
      const operationState = isRef(target[key]) ? Reflect.set(target[key], 'value', newValue) : Reflect.set(target, key, newValue);

      trigger(target, key, oldValue, newValue);

      // 如果有依赖属性
      if(Array.isArray(target)) {
        // 是数组,如果是新增元素就触发数组上的effect
        if(String(key) === String(length)) {// 都转化为字符串比较,如果key=length就是数组新增操作
          target?.[operateEffects.effectsIdentify]?.forEach(dep => dep.notify()); 
        }
      }else {
        // 不是数组，则是ownKeys操作器收集了依赖，触发effect
        target?.[operateEffects.effectsIdentify]?.forEach(dep => dep.notify());
      }
      return operationState;
    }
    return true;
  }
}

// 捕获ownKeys类操作,Object.keys等
function proxyOwnKeysHandler(target) {
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

    // 如果有依赖属性则是ownKeys操作器收集了依赖或者是数组中的东西，触发effect
    target?.[operateEffects.effectsIdentify]?.forEach(dep => dep.notify());
  }
  return isDeleted;
}

export {
  proxyGetter,
  createProxySetter,
  proxyOwnKeysHandler,
  proxyDeleteHandler,
  getValue,
  handleArray
}