export function toTime(millinSec,splitStr = ''){
	if(millinSec<0){
		return;
	}
	let hours = Math.floor(millinSec / 3600000);
	    millinSec = millinSec - hours * 3600000;
	let minutes = Math.floor(millinSec / 60000);
	    millinSec = millinSec - minutes * 60000;
	let seconds = Math.floor(millinSec / 1000);
	hours < 10 ? hours = '0' + hours : null;
	minutes < 10 ? minutes = '0' + minutes : null;
	seconds < 10 ? seconds = '0' + seconds : null;
	var time = hours + splitStr + minutes + splitStr + seconds;
	return time;
}