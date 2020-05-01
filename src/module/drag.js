export function drag(obj){
	let dragOffsetLeft,dragOffsetTop;
	let onMouseDownFunction = (e)=>{
		e = e || window.event;
		document.addEventListener('mousemove',onMouseMoveFunction,false);
			dragOffsetLeft = document.documentElement.scrollLeft + e.clientX - obj.offsetLeft;
			dragOffsetTop = document.documentElement.scrollTop + e.clientY - obj.offsetTop;
	}
	let onMouseMoveFunction = (e)=>{
		e = e || window.event;
		let elementLeft = document.documentElement.scrollLeft + e.clientX - dragOffsetLeft,
				elementTop = document.documentElement.scrollTop + e.clientY - dragOffsetTop;
		obj.style.cssText += ';left:' + elementLeft + 'px;top:' + elementTop + 'px;';
	}
	let onMouseUpFunction = (e)=>{
		e = e || window.event;
		document.removeEventListener('mousemove',onMouseMoveFunction,false);
	}
	obj.addEventListener('mousedown',onMouseDownFunction,false);
	obj.addEventListener('mouseup',onMouseUpFunction,false);
}