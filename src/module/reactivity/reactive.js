import { isObject, typeOf } from './utils.js';

import {
  defaultDepend,
  createGetters,
  createSetters,
} from './public.js';

import { isRef } from './ref.js';

function isReactiveObject(obj) {
  return obj instanceof Proxy;
}

// 创建一个handler，depend用于在每次get的时候收集依赖（如果有的话）
function createHandler(depend) {
  return {
    get: createGetters(depend),
    set: createSetters((v) => {// 新数据转换为响应式代理
      return (isObject(v) && !isRef(v)) ? createReactiveObject(v, createHandler(depend)) : v;
    })
  }
}

// 创建默认handler
function createDefaultHandler() {
  return createHandler(defaultDepend);
}

function createReactiveObject(obj, handler, transform = (obj, handler) => [obj, handler]) {
  if (!isObject(obj)) {
    return obj;
  }
  // 转换
  [obj, handler] = transform(obj, handler);
  // handler默认值
  if (!handler) {
    handler = createDefaultHandler();
  }
  // 遍历代理每个对象
  for (let key in obj) {
    const value = obj[key];
    if ((typeOf(value) === 'Object' || typeOf(value) === 'Array') && !isRef(value) && obj.hasOwnProperty(key)) {
      obj[key] = createReactiveObject(value, handler);
    }
  }
  return new Proxy(obj, handler);
}

function reactive(obj, depend = defaultDepend) {
  const result = createReactiveObject(obj, null, (obj) => {
    return [obj, createHandler(depend)]
  });
  return result;
};

export {
  createReactiveObject,
  reactive,
  isReactiveObject,
}