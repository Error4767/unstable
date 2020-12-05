import { watch } from './watch.js';

function watchEffect(effect, options) {
  return watch(effect, effect, options);
}

export {
  watchEffect
}