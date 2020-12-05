import { watch } from './watch.js';

import { ref } from './ref.js';

function computed(getter, options) {
  if (typeof getter === 'function') {
    let computedRef;
    watch(() => {
      // 定义ref并且观察依赖
      const value = getter();
      computedRef = ref(value);
    }, () => (computedRef.value = getter()), options)
    return computedRef;
  } else {
    return;
  }
}

export {
  computed
}