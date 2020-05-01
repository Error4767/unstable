export function setStyle(obj,cssStyle) {
	let cssText = ';';
	for(let cssAttr in cssStyle){
		cssText += cssAttr + ':' + cssStyle[cssAttr] + ';';
	}
	obj.style.cssText += cssText;
}
export function getStyle(obj,name) {
	return window.getComputedStyle ? getComputedStyle(obj,null)[name] : obj.currentStyle[name];
}