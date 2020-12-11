// 此文件中存储了一些原型，用于重写原型对象

import { readonly } from './readonly.js';
import { operateEffects } from './depend.js';

const arrayProto = Array.prototype;

const methods = [
  'push',
  'unshift',
  'pop',
  'shift',
  'reverse',
  'splice',
  'sort'
]

const mutatedArrayProto = Object.create(arrayProto);

methods.forEach(methodName=> {
  mutatedArrayProto[methodName] = function (...args) {
    arrayProto[methodName].call(this, ...args);
    // 触发effect
    this?.[operateEffects.effectsIdentifie]?.forEach(dep=> dep.notify());
  }
})

// 变为只读，不可被转换，标识符可防止被reactive响应式捕获
readonly(mutatedArrayProto);

export {
  mutatedArrayProto
}