import { setIdentify } from "./utils.js";

import { watch } from './watch.js';

import { ref } from './ref.js';
import { Watcher } from './depend.js';

const COMPUTED_IDENTIFY = "__isComputed";

function computed(getter, options) {
  if (typeof getter === 'function') {
    let computedRef = ref(undefined, getter);
    // 设置标识符
    setIdentify(computedRef, COMPUTED_IDENTIFY);

    // 更新computed状态的函数
    let refresh = () => computedRef.update();
    // 对应依赖改变触发ref更新
    watch(getter, refresh, options);

    return computedRef;
  } else {
    return;
  }
}

export {
  COMPUTED_IDENTIFY,
  computed
}