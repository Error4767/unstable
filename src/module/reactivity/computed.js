import { watch } from './watch.js';

import { ref } from './ref.js';

function computed(getter, options) {
  if (typeof getter === 'function') {
    let computedRef = ref(getter(), getter);
    computedRef.__isComputed = true;
    watch(getter, () => (computedRef.value = getter()), options)
    return computedRef;
  } else {
    return;
  }
}

export {
  computed
}