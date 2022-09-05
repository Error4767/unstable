import { isObject, setIdentify, setMutableIdentify } from './utils.js';

import { track, trigger } from './depend.js';

import { REF_IDENTIFY, MEMOIZED_IDENTIFY } from "./identifies.js";

// 忘记上次计算的值，下次读取需重新计算
function forget(ref) {
  ref[MEMOIZED_IDENTIFY] = false;
}

// 记住值，下次不再需要重新计算
function memoize(ref) {
  ref[MEMOIZED_IDENTIFY] = true;
}

function isRef(v) {
  return isObject(v) ? (v[REF_IDENTIFY] ? true : false) : false;
}

function ref(rawValue, getter) {
  // 如果是ref直接返回
  if(isRef(rawValue)) {
    return rawValue;
  }

  let value = rawValue;

  const refObject = {
    get value() {
      track(this, 'value');
      // 没有记忆就计算一次，并记忆
      if (!this[MEMOIZED_IDENTIFY] && getter) {
        getter && (value = getter());
        memoize(this);
      }
      return value;
    },
    set value(newValue) {
      if (value !== newValue /* 值改变了才需trigger */ && !getter /* getter不可直接设置值 */) {
        trigger(this, 'value', value, newValue);
        value = newValue;
        return true;
      }
      return false;
    },
    setGetter(newGetter) {
      getter = newGetter;
    },
    // 刷新memoize，仅限有getter的ref
    update() {
      if (getter) {
        // 忘记值
        forget(this);
        // 触发trigger重新计算
        trigger(this, 'value');
        return;
      }
    }
  }
  // ref标识
  setIdentify(refObject, REF_IDENTIFY);
  // memoized标识
  setMutableIdentify(refObject, MEMOIZED_IDENTIFY, false);
  return refObject;
}

// 获取单个引用
function toRef(rawObject, propName) {
  if(isRef(rawObject[propName])) {
    return rawObject[propName];
  }
  const refObject = {
    get value() {
      return rawObject[propName];
    },
    set value(newValue) {
      rawObject[propName] = newValue;
    }
  };
  setIdentify(refObject, REF_IDENTIFY);
  return refObject;
}

// 获取对象属性映射的所有引用
function toRefs(rawObject) {
  let refsObject = Array.isArray(rawObject) ? new Array(rawObject.length) : {};
  for(let key in rawObject) {
    refsObject[key] = toRef(rawObject, key);
  }
  return refsObject;
}

export {
  REF_IDENTIFY,
  MEMOIZED_IDENTIFY,
  ref,
  isRef,
  toRef,
  toRefs
}