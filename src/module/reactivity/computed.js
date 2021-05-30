import { setIdentify } from "./utils.js";

import { watch } from './watch.js';

import { ref } from './ref.js';
import { Watcher } from './depend.js';

const computedIdentify = "__isComputed";

function computed(getter, options) {
  if (typeof getter === 'function') {
    let computedRef = ref(undefined, getter);
    // 设置标识符
    setIdentify(computedRef, computedIdentify);

    let refresh = new Watcher(()=> computedRef.update());
    // 包装之后的Getter,在每次重新计算的时候再次收集依赖（关于数组依赖问题）
    // 对应依赖改变触发ref更新
    let packageGetter = ()=> {
      let newValue;
      watch(()=> (newValue = getter()), refresh, options);
      return newValue;
    };

    // 设置为包装后的getter
    computedRef.setGetter(packageGetter);

    return computedRef;
  } else {
    return;
  }
}

export {
  computed
}