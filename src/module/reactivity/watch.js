import { Watcher, defaultSetDepend, defaultClearDepend } from './depend.js';

import { isRef } from './ref.js';

// 根据类型调用对应getter完成依赖收集
function callGetters(dep) {
  // 是数组则遍历
  if (Array.isArray(dep)) {
    return dep.forEach((v) => callGetters(v));
  }
  // 函数直接调用
  if (typeof dep === 'function') {
    return dep();
  }
  // ref则读取value触发getter
  if (isRef(dep)) {
    return dep.value;
  }
}

function watch(dep, effect, options = {}) {
  const {
    setDepTarget = (watcher, dep) => {
      // 设置依赖等待收集
      defaultSetDepend(watcher);
      // 触发依赖收集
      callGetters(dep);
      // 收集完毕后清除
      defaultClearDepend();
    }
  } = options;
  setDepTarget(new Watcher(effect), dep);
}

export {
  watch
}