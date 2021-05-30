import { isObject, setIdentify, setMutableIdentify } from './utils.js';

import { defaultDepend, track, trigger } from './depend.js';

// ref标识
const REF_IDENTIFY = '__isRef';

// 记忆标识
const MEMOIZED_IDENTIFY = '__memoized';

// 忘记上次计算的值，下次读取需重新计算
function forget(ref) {
  ref[MEMOIZED_IDENTIFY] = false;
}

// 记住值，下次不再需要重新计算
function memoize(ref) {
  ref[MEMOIZED_IDENTIFY] = true;
}

function ref(initialValue, getter) {
  let value = initialValue;

  const refObject = {
    get value() {
      track(this, 'value', defaultDepend);
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

function isRef(v) {
  return isObject(v) ? (v[REF_IDENTIFY] ? true : false) : false;
}

export {
  ref,
  isRef,
}