function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

function isReactiveObject(obj) {
  return obj instanceof Proxy;
}

function typeOf(value) {
  let type = Object.prototype.toString.call(value, null);
  type = type.substring(8, type.indexOf(']'));
  return type;
}

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

// map中根据key存放一些dep
function createGetters(getWatcher, map = new Map()) {
  return function (target, key) {
    // getWatcher获取观察者(如果有的话),并放入map中
    const dep = typeof getWatcher === 'function' && getWatcher(target, key);
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
    return Reflect.get(...arguments);
  }
}

function createSetters(transform = v=> v, map = new Map()) {
  return function (target, key, value) {
    const oldValue = Reflect.get(target, key);
    if(oldValue !== value) {
      const newValue = transform(value);
      Reflect.set(target, key, newValue);
      map.get(key) && map.get(key).notify(oldValue, newValue);
    }
  }
}

// 创建一个handler，getWatcher用于在每次get的时候收集依赖（如果有的话）
function createHandler(getWatcher) {
  const map = new Map();
  return {
    get: createGetters(getWatcher, map),
    set: createSetters((v)=> {
      return isObject(v) ? createReactiveObject(v, createHandler(getWatcher)) : v;
    }, map)
  }
}

// 创建默认handler
function createDefaultHandler () {
  return createHandler(()=> Dep.target);
}

function createReactiveObject(obj, handler, transform = (obj, handler)=> [obj, handler]) {
  if (!isObject(obj)) {
    return obj;
  }
  // 转换
  [obj, handler] = transform(obj, handler);
  // handler默认值
  if(!handler) {
    handler = createDefaultHandler();
  }
  // 遍历代理每个对象
  for (let key in obj) {
    if ((typeOf(obj[key]) === 'Object' || typeOf(obj[key]) === 'Array') && obj.hasOwnProperty(key)) {
      obj[key] = createReactiveObject(obj[key], handler);
    }
  }
  return new Proxy(obj, handler);
}

function reactive (obj, getWatcher = ()=> Dep.target) {
  return createReactiveObject(obj, null, (obj, handler)=> {
    return [obj, createHandler(getWatcher)]
  });
};

function watch(collectDep, hook, options = {}) {
  const {
    setDepTarget = (watcher, collectDep)=> {
      Dep.target = watcher;
      collectDep();
      Dep.target = null;
    }
  } =  options;
  console.log(setDepTarget);
  setDepTarget(new Watcher(hook), collectDep);
}

function watchEffect(hook, options) {
  return watch(hook, hook, options);
}

export {
  Dep,
  Watcher,
  createGetters,
  createSetters,
  createHandler,
  createDefaultHandler,
  createReactiveObject,
  isReactiveObject,
  reactive,
  watch,
  watchEffect
}