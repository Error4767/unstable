// 识别特殊属性, 用于在下面 track 中排除（这些标记是不需要依赖收集的，取消可以提高性能）
import {
  REF_IDENTIFY,
  MEMOIZED_IDENTIFY,
  REACTIVE_IDENTIFY,
  COMPUTED_IDENTIFY,
  READONLY_IDENTIFY
} from "./identifies.js";
import { isRef } from './ref.js';

const SPECIAL_ATTRIBUTES = [
  REF_IDENTIFY,
  MEMOIZED_IDENTIFY,
  REACTIVE_IDENTIFY,
  READONLY_IDENTIFY,
  COMPUTED_IDENTIFY
];

// 依赖使用 set 和 map，自动更新合并，更新 set 确保每个 effect 只被执行一次，map 用于关联一些其他信息

// 更新集合
const waitUpdateEffectSet = new Set();
// 是否等待更新, true - 等待更新, false 更新中
let waitUpdate = true;

// 存放更新信息
const updateInfosMap = new Map();

class Dep {
  constructor() {
    // Set不会重复
    this.effects = new Set();
  }
  add(effect) {
    this.effects.add(effect);
  }
  notify(oldValue, newValue) {
    // 添加到队列中等待执行
    this.effects.forEach(effect => (waitUpdateEffectSet.add(effect), updateInfosMap.set(effect, { oldValue, newValue })));

    if (waitUpdate) {
      waitUpdate = false;
      Promise.resolve().then(() => {
        waitUpdateEffectSet.forEach(effect => {
          const { oldValue, newValue } = updateInfosMap.get(effect);
          runDepend(effect, effect.dep, { oldValue, newValue });
          // 如果不相等，则依赖收集和作用分开执行，执行一次 effect
          if (effect.dep !== effect) {
            effect(oldValue, newValue);
          }
        });
        waitUpdate = true;
      });
    }
  }
}

// 根据栈存放对应 effect，使用数组是为了防止computed中使用computed导致effect重写问题
let activeEffects = [];

// 默认的获取/设置/删除依赖方法
const defaultDepend = () => activeEffects[activeEffects.length - 1];

const defaultSetDepend = (watcher) => (activeEffects.push(watcher));

const defaultClearDepend = () => (activeEffects.pop());

// WeakMap在对象清除时自动释放对应依赖
const depMaps = new WeakMap();

// 根据类型调用对应getter完成依赖收集
function callGetters(dep, { oldValue, newValue } = {}) {
  // 是数组则遍历
  if (Array.isArray(dep)) {
    return dep.forEach((v) => callGetters(v, { oldValue, newValue }));
  }
  // 函数直接调用
  if (typeof dep === 'function') {
    return dep(oldValue, newValue);
  }
  // ref则读取value触发getter
  if (isRef(dep)) {
    return dep.value;
  }
}

const runDepend = (effect, dep, { oldValue, newValue } = {}) => {
  // 设置依赖等待收集
  defaultSetDepend(effect);
  // 触发依赖收集
  callGetters(dep, { oldValue, newValue });
  // 收集完毕后清除
  defaultClearDepend();
};

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
  runDepend,
  defaultDepend,
  defaultSetDepend,
  defaultClearDepend,
  track,
  trigger,
}