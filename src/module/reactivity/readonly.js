import { isObject, setIdentify } from './utils.js';

const READONLY_IDENTIFY = '__isReadonly';

function isReadonly(obj) {
  return obj[READONLY_IDENTIFY];
}

function shallowReadonly(obj) {
  setIdentify(obj, READONLY_IDENTIFY);
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
  READONLY_IDENTIFY,
  readonly,
  shallowReadonly,
  isReadonly
}