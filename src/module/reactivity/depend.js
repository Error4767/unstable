// 识别特殊属性, 用于在下面 track 中排除（这些标记是不需要依赖收集的，取消可以提高性能）
import { REF_IDENTIFY, MEMOIZED_IDENTIFY } from "./ref.js";
import { REACTIVE_IDENTIFY } from "./reactive.js";
import { READONLY_IDENTIFY }from "./readonly.js";
import { COMPUTED_IDENTIFY } from "./computed.js";

const SPECIAL_ATTRIBUTES = [
  REF_IDENTIFY,
  MEMOIZED_IDENTIFY,
  REACTIVE_IDENTIFY,
  READONLY_IDENTIFY,
  COMPUTED_IDENTIFY
];

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

// 根据栈存放对应watcher，使用数组是为了防止computed中使用computed导致effect重写问题
let activeEffects = [];

// 默认的获取/设置/删除依赖方法
const defaultDepend = () => activeEffects[activeEffects.length - 1];

const defaultSetDepend = (watcher) => (activeEffects.push(watcher));

const defaultClearDepend = () => (activeEffects.pop());

// WeakMap在对象清除时自动释放对应依赖
const depMaps = new WeakMap();

// 创建map的函数
function createMap(target) {
  const map = new Map();
  // 添加到 depMaps 中
  depMaps.set(target, map);
  return map;
}

// 依赖收集(依赖收集器可自定义)
function track(target, key, depend = defaultDepend) {
  // depend获取观察者(如果有的话),并放入map中
  const dep = typeof depend === 'function' && depend(target, key);
  // 添加依赖到map中, 排除特殊属性
  if (dep && !SPECIAL_ATTRIBUTES.includes(key)) {
    // 存在就读取，不存在就创建
    const map = depMaps.get(target) || createMap(target);
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
  // 获取依赖触发其 effect
  depMaps.get(target)?.get(key)?.notify(oldValue, newValue);
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