import { runDepend } from "./depend.js";

export function watch(dep, effect, { immediate } = {}) {
  effect.dep = dep;

    if (dep === effect) {
      // 如果相等则在运行的同时收集了依赖
      runDepend(effect, dep);
    }else {
      // 不相等则需要收集依赖以及运行副作用
      // 收集一次依赖
      runDepend(effect, dep);
      // 运行副作用
      immediate && effect();
  }
}