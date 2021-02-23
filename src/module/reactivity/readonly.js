import { isObject } from './utils.js';

const readonlyIdentifie = '__isReadonly';

function isReadonly(obj) {
  return obj[readonlyIdentifie];
}

function setIdentifie(obj) {
  Object.defineProperty(obj, readonlyIdentifie, {
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
  setIdentifie(obj);
  Object.freeze(obj);
  return obj;
}

export {
  readonly,
  isReadonly
}