export function toTime(milliSec,splitStr = ''){
	if(milliSec<0){
		return;
	}
	let hours = Math.floor(milliSec / 3600000);
		milliSec = milliSec - hours * 3600000;
	let minutes = Math.floor(milliSec / 60000);
		milliSec = milliSec - minutes * 60000;
	let seconds = Math.floor(milliSec / 1000);
	hours < 10 ? (hours = '0') + hours : null;
	minutes < 10 ? (minutes = '0') + minutes : null;
	seconds < 10 ? (seconds = '0') + seconds : null;
	var time = hours + splitStr + minutes + splitStr + seconds;
	return time;
}