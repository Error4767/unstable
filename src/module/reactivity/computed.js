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

    // 包装之后的Getter,在每次重新计算的时候再次收集依赖（关于数组依赖问题）
    // 对应依赖改变触发ref更新
    let packageGetter = ()=> {
      let newValue;
      watch(()=> (newValue = getter()), update, options);
      computedRef.value = newValue;
    };
    let update = new Watcher(packageGetter);

    packageGetter();// 初次调用

    return computedRef;
  } else {
    return;
  }
}

export {
  computed
}