import { isObject } from './utils.js';

const readonlyIdentify = '__isReadonly';

function isReadonly(obj) {
  return obj[readonlyIdentify];
}

function setIdentify(obj) {
  Object.defineProperty(obj, readonlyIdentify, {
    value: true,
    enumerable: false,
    writable: false
  });
}

function readonly(obj) {
  if(!isObject(obj)) {
    return;
  }
  for(let key in obj) {
    readonly(obj[key]);
  }
  setIdentify(obj);
  Object.freeze(obj);
  return obj;
}

export {
  readonly,
  isReadonly
}