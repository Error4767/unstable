import { isObject, setIdentify } from './utils.js';

import { defaultDepend, track, trigger } from './depend.js';

import { handleArray } from './operators.js';

// ref标识
const refIdentify = '__isRef';

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
    get value() {
      const { map } = track(this, 'value', defaultDepend);
      // 数组话做个处理
      if (Array.isArray(value)) {
        handleArray(value, map);
      }
      // 惰性求值
      if (this[lazyAttrName]) {
        getter && (value = getter());
        noNeedRecalculate(this);
      }
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {

        // 如果是getter就设置惰性求值，在getter中用到的时候求值
        if (getter) {
          needRecalculate(this);
          // 惰性计算也需要触发trigger，表示值已经改变，通知依赖
          trigger(this, 'value', value, newValue);
          return;
        }
        trigger(this, 'value', value, newValue);
        value = newValue;

        return true;
      }
    },
    [lazyAttrName]: false
  }
  setIdentify(refObject, refIdentify);
  return refObject;
}

function isRef(v) {
  return isObject(v) ? (v[refIdentify] ? true : false) : false;
}

export {
  ref,
  isRef,
  needRecalculate,
  noNeedRecalculate
}