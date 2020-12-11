class Dep {
  constructor() {
    this.subs = [];
  }
  add(watcher) {
    // 如果已经有了相同的观察者，则不再添加
    !this.subs.includes(watcher) && this.subs.push(watcher);
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
  effectsIdentifie: '__effects',
  // 设置对象的__effects属性指向依赖中的effects
  setEffects(target, map) {
    if (!target[this.effectsIdentifie]) {
      Object.defineProperty(target, this.effectsIdentifie, {
        value: map,
        enumerable: false
      });
    }
  }
}

// type: Watcher Instance
let activeEffect = null;

// 默认的获取/设置/删除依赖方法
const defaultDepend = () => activeEffect;

const defaultSetDepend = (watcher) => (activeEffect = watcher);

const defaultClearDepend = () => (activeEffect = null);

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