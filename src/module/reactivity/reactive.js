import { isObject, typeOf, setIdentify } from './utils.js';

import {
  proxyGetter,
  createProxySetter,
  proxyOwnKeysHandler,
  proxyDeleteHandler,
  proxyHasHandler,
} from './operators.js';

import { createProxyMapGetter } from "./mapHandlers.js";
import { createProxySetGetter } from "./setHandlers.js";

import { isReadonly } from './readonly.js';

import { isRef } from './ref.js';

import { REACTIVE_IDENTIFY } from "./identifies.js";

function isReactive(obj) {
  return isObject(obj) ? (obj[REACTIVE_IDENTIFY] ? true : false) : false;
}

// 创建handlers的函数
function createHandler(
  // handlerType: undefined / "Map" / "Set"
  handlerType = undefined,
  // setter转换器，如果是一般对象，则转化为响应式对象
  setterTransformer = (v) => {// 新数据转换为响应式代理
    return reactive(v);
  }
) {
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

// 创建shallReactive handlers
const proxyDefaultHandlersShallow = createHandler(undefined, (v) => v);
const proxyMapHandlersShallow = createHandler("Map", (v) => v);
const proxySetHandlersShallow = createHandler("Set", (v) => v);

// 判断是否可以转化为响应式对象
function isTransformableToReactive(obj) {
  // 特殊对象或者不是对象直接返回
  if (!isObject(obj) || isReactive(obj) || isRef(obj) || isReadonly(obj)) {
    return false;
  }
  return true;
}

// 创建反应式对象,只在该对象上，不递归创建（无条件判断，内部方法）
function createReactiveObject(obj, isShallow = false) {
  // 检测类型
  let objType = typeOf(obj);

  let handler;
  // 是否是浅层
  if (isShallow) {
    handler = objType === "Map" ? proxyMapHandlersShallow : (objType === "Set" ? proxySetHandlersShallow : proxyDefaultHandlersShallow);
  } else {
    // 根据类型选择对应handlers
    handler = objType === "Map" ? proxyMapHandlers : (objType === "Set" ? proxySetHandlers : proxyDefaultHandlers);
  }

  // 设置标识
  setIdentify(obj, REACTIVE_IDENTIFY);
  return new Proxy(obj, handler);
}

// 浅层反应式对象
function shallowReactive(obj) {
  return isTransformableToReactive(obj) ? createReactiveObject(obj, true) : obj;
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
  REACTIVE_IDENTIFY,
  reactive,
  shallowReactive,
  isReactive,
}