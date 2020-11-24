import { typeOf } from '../typeOf.js';
import { isObject } from '../isObject.js';

function isReactiveObject(obj) {
  return obj instanceof Proxy;
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

// 默认的获取依赖方法
const defaultGetDep = () => Dep.target;

// 该数组暂存所有的尾部回调,在reactive初始化或修改属性值后运行,此文件中用于在最后初始化计算属性
let tailCallbacks = [];

function runTailCallbacks() {
  // 调用尾部回调
  tailCallbacks && tailCallbacks.forEach(cb => cb());
  // 清空尾部回调队列
  tailCallbacks = [];
}

// 如果是特殊类型，返回对应规则的值，否则原值返回
function specicalTypeGetValue(value) {
  if (typeof value === 'function' && value.type === 'computed') {
    // 获取函数上缓存的value值
    return value.value;
  }
  return value;
}

// map中根据key存放一些dep
function createGetters(getWatcher) {
  return function (target, key) {
    // getWatcher获取观察者(如果有的话),并放入map中
    const dep = typeof getWatcher === 'function' && getWatcher(target, key);
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
    let value = specicalTypeGetValue(Reflect.get(...arguments));
    return value;
  }
}

function createSetters(transform = v => v) {
  // transform是转换设置的新数据的函数
  return function (target, key, value) {
    const oldValue = Reflect.get(target, key);
    if (oldValue !== value) {
      const newValue = transform(value);
      let map = getMap(target);
      Reflect.set(target, key, newValue);
      map.get(key) && map.get(key).notify(oldValue, newValue);
      runTailCallbacks();
    }
  }
}

// 创建一个handler，getWatcher用于在每次get的时候收集依赖（如果有的话）
function createHandler(getWatcher) {
  return {
    get: createGetters(getWatcher),
    set: createSetters((v) => {// 新数据转换为响应式代理
      return isObject(v) ? createReactiveObject(v, createHandler(getWatcher)) : v;
    })
  }
}

// 创建默认handler
function createDefaultHandler() {
  return createHandler(defaultGetDep);
}

function createReactiveObject(obj, handler, transform = (obj, handler) => [obj, handler]) {
  if (!isObject(obj)) {
    return obj;
  }
  // 转换
  [obj, handler] = transform(obj, handler);
  // handler默认值
  if (!handler) {
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

function reactive(obj, getWatcher = defaultGetDep) {
  const result = createReactiveObject(obj, null, (obj, handler) => {
    return [obj, createHandler(getWatcher)]
  });
  runTailCallbacks();
  return result;
};

function watch(collectDep, hook, options = {}) {
  const {
    setDepTarget = (watcher, collectDep) => {
      Dep.target = watcher;
      collectDep();
      Dep.target = null;
    }
  } = options;
  setDepTarget(new Watcher(hook), collectDep);
}

function watchEffect(effect, options) {
  return watch(effect, effect, options);
}

function computed(getter, options) {
  typeof getter === 'function' && (getter.type = 'computed');
  tailCallbacks.push(() => watchEffect(() => (getter.value = getter()), options));
  return getter;
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
  watchEffect,
  computed
}