const once = (fn, self = null)=> {
  let is = true;
  return function(...args) {
    if(is) {
      is = false;
      return fn.apply(self, args);
    }
  }
}
export {
  once
};