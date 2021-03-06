class Dep {
  constructor() {
    // Set不会重复
    this.subs = new Set();
  }
  add(watcher) {
    this.subs.add(watcher);
  }
  notify(oldValue, newValue) {
    this.subs.forEach(watcher => watcher.update(oldValue, newValue))
  }
}

class Watcher {
  constructor(callback) {
    this.callback = callback;
  }
  update(oldValue, newValue) {
    this.callback(oldValue, newValue);
  }
}

// 用于在对象上创建effects并且存放依赖
const operateEffects = {
  effectsIdentify: '__effects',
  // 设置对象的__effects属性指向依赖中的effects
  setEffects(target, map) {
    if (!target[this.effectsIdentify]) {
      Object.defineProperty(target, this.effectsIdentify, {
        value: map,
        enumerable: false
      });
    }
  }
}

// 根据栈存放对应watcher，使用数组是为了防止computed中使用computed导致effect重写问题
let activeEffects = [];

// 默认的获取/设置/删除依赖方法
const defaultDepend = () => activeEffects[activeEffects.length - 1];

const defaultSetDepend = (watcher) => (activeEffects.push(watcher));

const defaultClearDepend = () => (activeEffects.pop());

// WeakMap在对象清除时自动释放对应依赖
const depMaps = new WeakMap();

// 获取map的函数,从depMaps中
function getMap(target) {
  let map;
  // 存在map直接获取不存在就创建
  if (depMaps.has(target)) {
    map = depMaps.get(target);
  } else {
    map = new Map();
    depMaps.set(target, map);
  }
  return map;
}

// 依赖收集
function track(target, key, depend) {
  // depend获取观察者(如果有的话),并放入map中
  const dep = typeof depend === 'function' && depend(target, key);
  let map = getMap(target);
  // 添加依赖到map中
  if (dep) {
    if (map.has(key)) {
      map.get(key).add(dep);
    } else {
      const deps = new Dep();
      deps.add(dep);
      map.set(key, deps);
    }
  }
  return {
    map,
    dep
  };
}

// 触发器(触发effect)
function trigger(target, key, oldValue, newValue) {
  let map = getMap(target);
  map.get(key) && map.get(key).notify(oldValue, newValue);
}

export {
  Dep,
  Watcher,
  getMap,
  defaultDepend,
  defaultSetDepend,
  defaultClearDepend,
  track,
  trigger,
  operateEffects,
}