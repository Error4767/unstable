import { isObject, setIdentify } from './utils.js';

const readonlyIdentify = '__isReadonly';

function isReadonly(obj) {
  return obj[readonlyIdentify];
}

function readonly(obj) {
  if(!isObject(obj)) {
    return;
  }
  for(let key in obj) {
    readonly(obj[key]);
  }
  setIdentify(obj, readonlyIdentify);
  Object.freeze(obj);
  return obj;
}

export {
  readonly,
  isReadonly
}