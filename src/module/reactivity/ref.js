import { isObject } from './utils.js';

import { defaultDepend, track, trigger } from './depend.js';

// ref标识
const refTypeName = '__isRef';

// 惰性求值属性标识
const lazyAttrName = '__needRecalculate';

// 读取时需要重新计算
function needRecalculate(ref) {
  ref[lazyAttrName] = true;
}

// 读取时不需要重新计算
function noNeedRecalculate(ref) {
  ref[lazyAttrName] = false;
}

function ref(initialValue, getter) {
  // isReadonly是定义是否只读属性，warnMessage指给只读属性赋值的时候的警告文本
  let value = initialValue;

  const refObject = {
    [refTypeName]: true,
    get value() {
      track(this, 'value', defaultDepend);
      // 惰性求值
      if(this[lazyAttrName]) {
        getter && (value = getter());
        noNeedRecalculate(this);
      }
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {
        // 如果是getter就设置惰性求值，在getter中用到的时候求值
        if(getter) {
          needRecalculate(this);
          return;
        }
        const oldValue = value;
        value = newValue;
        trigger(this, 'value', oldValue, newValue);
        return true;
      }
    },
    [lazyAttrName]: false
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