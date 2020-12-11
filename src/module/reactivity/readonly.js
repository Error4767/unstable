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
  for(let value of obj) {
    isObject(value) && Object.freeze(value);
  }
  setIdentifie(obj);
  Object.freeze(obj);
  return obj;
}

export {
  readonly,
  isReadonly
}