import { isObject } from './utils.js';

import { defaultDepend, track, trigger } from './public.js';

// ref标识
const refTypeName = '__isRef';

function ref(initialValue) {
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