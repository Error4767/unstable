export { typeOf } from '../typeOf.js';
export { isObject } from '../isObject.js';

// 设置对应不可配置的标识符
function setIdentify(obj, identifyName) {
  Object.defineProperty(obj, identifyName, {
    value: true,
    enumerable: false,
    writable: false
  });
}

// 设置可变标识符
function setMutableIdentify(obj, identifyName, initValue) {
  Object.defineProperty(obj, identifyName, {
    value: initValue,
    enumerable: false,
    writable: true
  });
}

export { setIdentify, setMutableIdentify };