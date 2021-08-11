export function drag(obj) {
  let dragOffsetLeft, dragOffsetTop;
  // PC 
  let onMouseDownFunction = (e) => {
    e = e || window.event;
    document.addEventListener('mousemove', onMouseMoveFunction, false);
    dragOffsetLeft = document.documentElement.scrollLeft + e.clientX - obj.offsetLeft;
    dragOffsetTop = document.documentElement.scrollTop + e.clientY - obj.offsetTop;
  }
  let onMouseMoveFunction = (e) => {
    e = e || window.event;
    let elementLeft = document.documentElement.scrollLeft + e.clientX - dragOffsetLeft,
      elementTop = document.documentElement.scrollTop + e.clientY - dragOffsetTop;
    obj.style.cssText += ';left:' + elementLeft + 'px;top:' + elementTop + 'px;';
  }
  let onMouseUpFunction = (e) => {
    e = e || window.event;
    document.removeEventListener('mousemove', onMouseMoveFunction, false);
  }
  obj.addEventListener('mousedown', onMouseDownFunction, false);
  obj.addEventListener('mouseup', onMouseUpFunction, false);

  // 移动端
  let onTouchStartFunction = (e) => {
    document.addEventListener('touchmove', onTouchMoveFunction, { passive: false } /* 阻止浏览器默认的下拉刷新 */);
    dragOffsetLeft = document.documentElement.scrollLeft + e.changedTouches[0].clientX - obj.offsetLeft;
    dragOffsetTop = document.documentElement.scrollTop + e.changedTouches[0].clientY - obj.offsetTop;
  }
  let onTouchMoveFunction = (e) => {
    // 阻止页面的默认滚动
    e.preventDefault();
    let elementLeft = document.documentElement.scrollLeft + e.changedTouches[0].clientX - dragOffsetLeft,
      elementTop = document.documentElement.scrollTop + e.changedTouches[0].clientY - dragOffsetTop;
    obj.style.cssText += ';left:' + elementLeft + 'px;top:' + elementTop + 'px;';
  }
  let onTouchEndFunction = (e) => {
    e.preventDefault();
    document.removeEventListener('touchmove', onTouchMoveFunction);
  }
  obj.addEventListener("touchstart", onTouchStartFunction);
  obj.addEventListener("touchend", onTouchEndFunction);
}