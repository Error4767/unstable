import { isObject, typeOf } from './utils.js';

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

import { RAW_IDENTIFY, KEEP_RAW_IDENTIFY } from "./identifies.js";

function isReactive(obj) {
  return isObject(obj) ? (isReactiveMap.get(obj) ? true : false) : false;
}

// 创建handlers的函数
function createHandler(
  // handlerType: undefined / "Map" / "Set"
  handlerType = undefined,
  // getter 数据转换器
  getterTransform = (v) => v,
) {
  return {
    // 如果是 map, set 就使用对应 getter，否则使用默认getter
    get: handlerType === "Map"
      ? createProxyMapGetter({ getterTransform })
      : (handlerType === "Set" ? createProxySetGetter({ getterTransform }) : (target, key)=> proxyGetter(target, key, getterTransform)),
    set: createProxySetter(),
    ownKeys: proxyOwnKeysHandler,
    deleteProperty: proxyDeleteHandler,
    has: proxyHasHandler,
  }
}

// 如果不可转换，返回原始对象，否则返回反应式对象
function createGetterTransform(isShallow) {
  // 不可转化对象或者浅层反应式，就返回原始
  return (obj, { target, key })=> {
    // 获取原始对象
    if(key === RAW_IDENTIFY) {
      return target;
    }
    return (isTransformableToReactive(obj) && !isShallow) ? createReactiveObject(obj) : obj;
  };
}

// 创建handlers
const proxyDefaultHandlers = createHandler(undefined, createGetterTransform());
const proxyMapHandlers = createHandler("Map", createGetterTransform());
const proxySetHandlers = createHandler("Set", createGetterTransform());

// 创建shallReactive handlers
const proxyDefaultHandlersShallow = createHandler(undefined, createGetterTransform(true));
const proxyMapHandlersShallow = createHandler("Map", createGetterTransform(true));
const proxySetHandlersShallow = createHandler("Set", createGetterTransform(true));

// 判断是否可以转化为响应式对象
function isTransformableToReactive(obj) {
  // 特殊对象或者不是对象直接返回
  if (!isObject(obj) || isReactive(obj) || isRef(obj) || isReadonly(obj) || obj[KEEP_RAW_IDENTIFY]) {
    return false;
  }
  return true;
}

const reactiveObjectMap = new WeakMap();
const isReactiveMap = new WeakMap();

// 创建反应式对象,只在该对象上，不递归创建（无条件判断，内部方法）
function createReactiveObject(obj, isShallow = false) {
  // 如果已经创建了，直接返回
  const existingReactiveObject = reactiveObjectMap.get(obj);
  if(existingReactiveObject) {
    return existingReactiveObject;
  }

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

  // 创建反应式对象
  const proxyObject = new Proxy(obj, handler);
  // 存至 map 中
  reactiveObjectMap.set(obj, proxyObject);
  isReactiveMap.set(proxyObject, true);

  return proxyObject;
}

// 浅层反应式对象
function shallowReactive(obj) {
  return isTransformableToReactive(obj) ? createReactiveObject(obj, true) : obj;
}

function reactive(obj) {
  if (!isTransformableToReactive(obj)) {
    return obj;
  }
  return createReactiveObject(obj);
}

function toRaw(reactiveObj) {
  return reactiveObj?.[RAW_IDENTIFY];
}
function markRaw(obj) {
  isObject(obj) && (obj[KEEP_RAW_IDENTIFY] = true);
  return obj;
}

export {
  reactive,
  shallowReactive,
  isReactive,
  toRaw,
  markRaw,
}