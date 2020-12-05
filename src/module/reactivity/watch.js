import { Dep, Watcher } from './public.js';

function watch(getter, effect, options = {}) {
  const {
    setDepTarget = (watcher, getter) => {
      Dep.target = watcher;
      getter();
      Dep.target = null;
    }
  } = options;
  setDepTarget(new Watcher(effect), getter);
}

export {
  watch
}