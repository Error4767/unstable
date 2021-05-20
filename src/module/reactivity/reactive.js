import { isObject, typeOf, setIdentify } from './utils.js';

import { getMap } from './depend.js';

import {
  proxyGetter,
  createProxySetter,
  proxyOwnKeysHandler,
  proxyDeleteHandler,
  handleArray,
} from './operators.js';

import { createProxyMapGetter } from "./mapHandlers.js";

import { isReadonly } from './readonly.js';

import { isRef } from './ref.js';

const reactiveIdentify = '__isReactive';

function isReactiveObject(obj) {
  return obj[reactiveIdentify];
}

// 创建handlers的函数
function createHandler(handlerType) { // handlerType: undefined / "map"
  // setter转换器，如果是一般对象，则转化为响应式对象
  let setterTransformer = (v) => {// 新数据转换为响应式代理
    return createReactiveObject(v);
  }

  return {
    // 如果是map使用mapGetter，否则使用默认getter
    get: handlerType === "Map" ? createProxyMapGetter(setterTransformer) : proxyGetter,
    set: createProxySetter(setterTransformer),
    ownKeys: proxyOwnKeysHandler,
    deleteProperty: proxyDeleteHandler,
  }
}

// 创建handlers
const proxyDefaultHandlers =createHandler();
const proxyMapHandlers = createHandler("Map");

function createReactiveObject(obj, handler, transform = (obj, handler) => [obj, handler]) {
  // ref或者已经是reactive直接返回
  if (!isObject(obj) || isReactiveObject(obj) || isRef(obj) || isReadonly(obj)) {
    return obj;
  }
  // 转换
  [obj, handler] = transform(obj, handler);
  // handler默认值
  if (!handler) {
    // 根据类型选择对应handlers
    handler = typeOf(obj) === "Map" ? proxyMapHandlers : proxyDefaultHandlers;
  }
  // 遍历代理每个对象
  for (let key in obj) {
    const value = obj[key];
    if (obj.hasOwnProperty(key)) {
      obj[key] = createReactiveObject(value);
    }
  }
  setIdentify(obj, reactiveIdentify);
  if (Array.isArray(obj)) {
    let map = getMap(obj);
    handleArray(obj, map);
  }
  return new Proxy(obj, handler);
}

function reactive(obj) {
  return createReactiveObject(obj);
};

export {
  createReactiveObject,
  reactive,
  isReactiveObject,
}