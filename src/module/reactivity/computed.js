import { watch } from './watch.js';

import { ref } from './ref.js';
import { Watcher } from './depend.js';

function computed(getter, options) {
  if (typeof getter === 'function') {
    let computedRef = ref(getter());
    computedRef.__isComputed = true;
    // 设置观察者
    const update = new Watcher(() => (computedRef.value = getter()));
    // 包装之后的getter
    const packagedGetter = ()=> {
      // 重新观察，新的依赖添加更新computed方法(如果有的话)
      let newValue;
      watch(()=>(newValue = getter())/* 用变量接受计算结果 */, update, options);
      // 返回计算结果
      return newValue;
    }
    // 设置ref的getter为包装后的getter
    computedRef.getter = packagedGetter;
    // 运行一次getter计算并收集依赖
    packagedGetter();
    return computedRef;
  } else {
    return;
  }
}

export {
  computed
}