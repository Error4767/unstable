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
  const isEqual = dep === effect;
  const {
    // 设置depend并且运行getter(dep)
    runEffect = (watcher, dep) => {
      // 设置依赖等待收集
      defaultSetDepend(watcher);
      // 触发依赖收集
      callGetters(dep);
      // 收集完毕后清除
      defaultClearDepend();
      options.immediate && !isEqual && effect(); // immediate属性true则立即运行一次effect
    }
  } = options;
  let reactiveWatcher;
  // 转化为带依赖收集的 effect，每次会尝试收集依赖，防止如条件运算之类的导致先前没有收集到依赖
  const reactiveEffect = () => {
    if (isEqual) {
      // 如果相等则在运行的同时收集了依赖
      runEffect(reactiveWatcher, dep);
    }else {
      // 不相等则需要运行副作用以及收集依赖
      // 运行副作用
      effect();
      // 收集一次依赖
      runEffect(reactiveWatcher, dep);
    }
  }
  reactiveWatcher = new Watcher(reactiveEffect);
  // 运行一次
  reactiveEffect();
}

export {
  watch
}