import { isObject } from './utils.js';

import { defaultDepend, track, trigger } from './depend.js';

// ref标识
const refTypeName = '__isRef';

function ref(initialValue) {
  // isReadonly是定义是否只读属性，warnMessage指给只读属性赋值的时候的警告文本
  let value = initialValue;

  const refObject = {
    [refTypeName]: true,
    get value() {
      track(this, 'value', defaultDepend);
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {
        const oldValue = value;
        value = newValue;
        trigger(this, 'value', oldValue, newValue);
        return true;
      }
    }
  }
  return refObject;
}

function isRef(v) {
  return isObject(v) ? (v[refTypeName] ? true : false) : false;
}

export {
  ref,
  isRef
}