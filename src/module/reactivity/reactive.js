import { isObject, typeOf, setIdentify } from './utils.js';

import { getMap } from './depend.js';

import {
  proxyGetter,
  createProxySetter,
  proxyOwnKeysHandler,
  proxyDeleteHandler,
  proxyHasHandler,
  handleArray,
} from './operators.js';

import { createProxyMapGetter } from "./mapHandlers.js";
import { createProxySetGetter } from "./setHandlers.js";

import { isReadonly } from './readonly.js';

import { isRef } from './ref.js';

const reactiveIdentify = '__isReactive';

function isReactive(obj) {
  return isObject(obj) ? (obj[reactiveIdentify] ? true : false) : false;
}

// 创建handlers的函数
function createHandler(handlerType) { // handlerType: undefined / "Map" / "Set"
  // setter转换器，如果是一般对象，则转化为响应式对象
  let setterTransformer = (v) => {// 新数据转换为响应式代理
    return reactive(v);
  }

  return {
    // 如果是 map, set 就使用对应 getter，否则使用默认getter
    get: handlerType === "Map" 
    ? createProxyMapGetter(setterTransformer) 
    : (handlerType === "Set" ? createProxySetGetter(setterTransformer) : proxyGetter),
    set: createProxySetter(setterTransformer),
    ownKeys: proxyOwnKeysHandler,
    deleteProperty: proxyDeleteHandler,
    has: proxyHasHandler,
  }
}

// 创建handlers
const proxyDefaultHandlers = createHandler();
const proxyMapHandlers = createHandler("Map");
const proxySetHandlers = createHandler("Set");

// 判断是否可以转化为响应式对象
function isTransformableToReactive(obj) {
  // 特殊对象或者不是对象直接返回
  if (!isObject(obj) || isReactive(obj) || isRef(obj) || isReadonly(obj)) {
    return false;
  }
  return true;
}

// 创建反应式对象,只在该对象上，不递归创建（无条件判断，内部方法）
function createReactiveObject(obj) {
  // 检测类型
  let objType = typeOf(obj);
  // 根据类型选择对应handlers
  let handler = objType === "Map" ? proxyMapHandlers : ( objType === "Set" ? proxySetHandlers : proxyDefaultHandlers);
  // 设置标识
  setIdentify(obj, reactiveIdentify);
  // 数组额外处理
  if (Array.isArray(obj)) {
    let map = getMap(obj);
    handleArray(obj, map);
  }
  return new Proxy(obj, handler);
}

// 浅层反应式对象
function shallowReactive(obj) {
  return isTransformableToReactive(obj) ? createReactiveObject(obj) : obj;
}

function reactive(obj) {
  if (!isTransformableToReactive(obj)) {
    return obj;
  }

  // 遍历代理每个对象
  for (let key in obj) {
    const value = obj[key];
    if (obj.hasOwnProperty(key)) {
      obj[key] = reactive(value);
    }
  }
  return createReactiveObject(obj);
}

export {
  reactive,
  shallowReactive,
  isReactive,
}