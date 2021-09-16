import { track, trigger, defaultDepend } from "./depend.js";

import { proxyGetter, getValue } from "./operators.js";

import { isRef } from "./ref.js";

let mapPrototype = Map.prototype;

// map其他方法的名字，用于proxy使用时绑定this
let mapOtherMethodNames = [
  "forEach",
  "keys",
  "values",
  "entries",
  Symbol.iterator
];

// proxy map handler getter
function createProxyMapGetter(transform = v => v) {
  const mapMethods = {
    get(key) {
      let value = mapPrototype.get.call(this, key);
      const { map } = track(this, key, defaultDepend);
      // 是数组则处理一下
      Array.isArray(value) && handleArray(value, map);
      return getValue(value);
    },
    set(key, value) {
      let oldValue = mapPrototype.get.call(this, key);
      // todo
      if (oldValue !== value) {
        const newValue = transform(value);

        // 是ref设置其value，不是ref直接设置其值
        const operationState = isRef(oldValue) ? Reflect.set(oldValue, 'value', newValue) : mapPrototype.set.call(this, key, value);

        trigger(this, key, oldValue, newValue);

        return operationState;
      }
    },
    delete(key) {
      const oldValue = mapPrototype.get.call(this, key);

      // 之前map的尺寸
      let oldSize = this.size;

      const isDeleted = mapPrototype.delete.call(this, key);
      if (isDeleted) {// 成功删除则触发对应动作
        // 触发标准动作
        trigger(this, key, oldValue, undefined);
        // 触发size动作
        trigger(this, "size", oldSize, oldSize - 1);
      }
      // 返回操作结果 true | false
      return isDeleted;
    },
    clear() {
      let length = this.size;

      // 长度不为0就可以清理
      if (length > 0) {
        let actions = [];
        // 已有属性的动作添加到数组中，在删除后触发
        this.forEach((value, key)=> {
          actions.push(()=> trigger(this, key, value, undefined));
        });
        
        mapPrototype.clear.call(this);
        // 运行所有属性绑定的动作
        actions.forEach(fn=> fn());
        // 清理之后尺寸改变触发size动作
        trigger(this, "size", length, 0);
      }
    },
    has(key) {
      let value = mapPrototype.has.call(this, key);
      track(this, key, defaultDepend);
      return value;
    }
  };

  return function proxyMapGetter(target, key) {
    // 如果实例上不存在属性，且访问的是map的标准方法,则返回变异方法
    if (!target.hasOwnProperty(key)) {
      // 如果是map的操作
      if (mapMethods.hasOwnProperty(key)) {
        return mapMethods[key].bind(target);
      }
      // map的其它标准方法绑定this
      if (mapOtherMethodNames.includes(key)) {
        return target[key].bind(target);
      }
    }

    // 如果是普通的属性读取，就使用一般对象的getter
    return proxyGetter(target, key);
  }
}

export {
  createProxyMapGetter
}