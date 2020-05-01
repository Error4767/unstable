export function formatDate(date, format) {
	if(typeof format !== 'string') {
		return;
	}
	if(!date instanceof Date) {
		return;
	}
	let o = {
		'M+': date.getMonth() + 1,
		'd+': date.getDate(),
		'h+': date.getHours(),
		'm+': date.getMinutes(),
		's+': date.getSeconds(),
		'q+': Math.ceil((date.getMonth() + 1) / 3),
		'S': date.getMilliseconds()
	}
	let yearFormat = format.match(/y+/);
	yearFormat = yearFormat instanceof Array ? yearFormat[0] : '';
	if(yearFormat) {
		format = format.replace(yearFormat, String(date.getFullYear()).substr(4 - yearFormat.length));
	}
	for(let key in o) {
		let currentFormat = format.match(new RegExp('(' + key + ')'));
		currentFormat = currentFormat instanceof Array ? currentFormat[0] : '';
		if(currentFormat) {
			let length = String(currentFormat).length;
			format = format.replace(currentFormat, length === 1 ? o[key] : ('00' + o[key]).substr(String(o[key]).length));
		}
	}
	return format;
}