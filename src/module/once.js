const once = (fn, self = null)=> {
  let is = true;
  return function(...args) {
    if(is) {
      fn.apply(self, args);
      is = false;
    }
  }
}
export default once;