import { isObject, typeOf } from './utils.js';

import {
  defaultDepend,
} from './depend.js';

import {
  createProxyGetter,
  createProxySetter,
  createProxyOwnKeysHandler
} from './operators.js';

import { isReadonly } from './readonly.js';

import { isRef } from './ref.js';

const reactiveIdentifieAttr = '__isReactive';

// 设置标识
function setIdentifie(obj) {
  Object.defineProperty(obj, reactiveIdentifieAttr, {
    value: true,
    enumerable: false,
    writable: false
  });
}

function isReactiveObject(obj) {
  return obj[reactiveIdentifieAttr];
}

// 创建一个handler，depend用于在每次get的时候收集依赖（如果有的话）
function createHandler(depend) {
  return {
    get: createProxyGetter(depend),
    set: createProxySetter((v) => {// 新数据转换为响应式代理
      return (isObject(v) && !isRef(v)) ? createReactiveObject(v, createHandler(depend)) : v;
    }),
    ownKeys: createProxyOwnKeysHandler()
  }
}

// 创建默认handler
function createDefaultHandler() {
  return createHandler(defaultDepend);
}

function createReactiveObject(obj, handler, transform = (obj, handler) => [obj, handler]) {
  // ref或者已经是reactive直接返回
  if (!isObject(obj) || isReactiveObject(obj) || isRef(obj) || isReadonly(obj)) {
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
    if ((typeOf(value) === 'Object' || typeOf(value) === 'Array') && obj.hasOwnProperty(key)) {
      obj[key] = createReactiveObject(value, handler);
    }
  }
  setIdentifie(obj);
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