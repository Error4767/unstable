import { isObject, setIdentify } from './utils.js';

const readonlyIdentify = '__isReadonly';

function isReadonly(obj) {
  return obj[readonlyIdentify];
}

function shallowReadonly(obj) {
  setIdentify(obj, readonlyIdentify);
  Object.freeze(obj);
  return obj;
}

function readonly(obj) {
  if(!isObject(obj)) {
    return obj;
  }
  for(let key in obj) {
    readonly(obj[key]);
  }
  shallowReadonly(obj);
  return obj;
}

export {
  readonly,
  shallowReadonly,
  isReadonly
}