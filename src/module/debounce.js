export function debounce(fn, delay, self) {
	let timer = null;
	return function(...args) {
		if(timer) {clearTimeout(timer)}
		timer = setTimeout(()=> {
			self ? fn.apply(self, args) : fn.apply(window, args);
		}, delay);
	}
}