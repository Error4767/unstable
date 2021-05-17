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

export { setIdentify };