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

// 默认的获取依赖方法
const defaultDepend = () => Dep.target;

const defaultSetDepend = (watcher)=> (Dep.target = watcher);

const defaultClearDepend = ()=> (Dep.target = null);

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
}

// 触发器(触发effect)
function trigger(target, key, oldValue, newValue) {
  let map = getMap(target);
  map.get(key) && map.get(key).notify(oldValue, newValue);
}

export {
  Dep,
  Watcher,
  defaultDepend,
  defaultSetDepend,
  defaultClearDepend,
  track,
  trigger,
}