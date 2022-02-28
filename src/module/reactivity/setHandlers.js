import { track, trigger } from "./depend.js";

import { proxyGetter } from "./operators.js";

let setPrototype = Set.prototype;

const setOtherMethodNames = [
  "forEach",
  "keys",
  "values",
  "entries"
];

export function createProxySetGetter(transform = v => v) {
  let setMethods = {
    add(value) {
      setPrototype.add.call(this, value);
      // 触发迭代操作的 effect
      trigger(this, Symbol.iterator);
    },
    delete(value) {
      // 之前map的尺寸
      let oldSize = this.size;

      const isDeleted = setPrototype.delete.call(this, value);
      if (isDeleted) {// 成功删除则触发对应动作
        // 触发标准动作
        trigger(this, value, value, undefined);
        // set 只需触发size动作
        trigger(this, "size", oldSize, oldSize - 1);
        // 触发迭代操作的 effect
        trigger(this, Symbol.iterator);
      }
      // 返回操作结果 true | false
      return isDeleted;
    },
    clear() {
      let length = this.size;

      // 长度不为0就可以清理
      if (length > 0) {
        let actions = [];
        // 已有项的动作添加到数组中，在删除后触发
        this.forEach((value) => {
          actions.push(() => trigger(this, value, value, undefined));
        });

        setPrototype.clear.call(this);
        // 运行所有项绑定的动作
        actions.forEach(fn => fn());
        // 清理之后尺寸改变触发size动作
        trigger(this, "size", length, 0);
        // 触发迭代操作的 effect
        trigger(this, Symbol.iterator);
      }
    },
    has(value) {
      let isHad = setPrototype.has.call(this, value);
      track(this, value);
      return isHad;
    },
    [Symbol.iterator]() {
      // 依赖收集
      track(this, Symbol.iterator);
      return setPrototype[Symbol.iterator].call(this);
    }
  };
  return function proxySetGetter(target, key) {
    // 如果实例上不存在属性，且访问的是set的标准方法,则返回变异方法
    if (!target.hasOwnProperty(key)) {
      if (setMethods.hasOwnProperty(key)) {
        return setMethods[key].bind(target);
      }
      if (setOtherMethodNames.includes(key)) {
        return target[key].bind(target);
      }
    }
    return proxyGetter(target, key);
  }
}