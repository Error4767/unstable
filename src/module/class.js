export function addClass(obj, className) {
	obj.className += ' ' + className;
}
export function hasClass(obj, className) {
	let reg = new RegExp('\\b' + className + '\\b');
	return reg.test(className);
}
export function removeClass(obj, className) {
	var reg = new RegExp('\\b' + className + '\\b');
	obj.className = obj.className.replace(reg, '');
}
export function toggleClass(obj, className) {
	if (this.hasClass(obj, className) == true) {
		this.removeClass(obj, className);
	} else {
		this.addClass(obj, className);
	}
}