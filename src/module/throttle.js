export function throttle(fn, interval = 50, self) {
  let lastTime = null;
  return function(...args) {
    let currentTime = new Date();
    if(currentTime - lastTime > interval || !lastTime) {
      lastTime = currentTime;
      self ? fn.apply(self, args) : fn.apply(window, args);
    }
  }
}