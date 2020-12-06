import { track, trigger } from './depend.js';

import { isRef } from './ref.js';

// 如果是ref类型，返回其value属性值，否则原值返回
function getValue(value) {
  return isRef(value) ? value.value : value;
}

// map中根据key存放一些dep
function createProxyGetter(depend) {
  return function (target, key) {
    track(target, key, depend);
    let value = getValue(Reflect.get(...arguments));
    return value;
  }
}

function createProxySetter(transform = v => v) {
  // transform是转换设置的新数据的函数
  return function (target, key, value) {
    const oldValue = Reflect.get(target, key);
    if (oldValue !== value) {
      const newValue = transform(value);

      // 是ref设置其value，不是ref直接设置其值
      const operationState = isRef(target[key]) ? Reflect.set(target[key], 'value', newValue) : Reflect.set(target, key, newValue);
      
      trigger(target, key, oldValue, newValue);
      
      return operationState;
    }
    return true;
  }
}


export {
  createProxyGetter,
  createProxySetter,
}