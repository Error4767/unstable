import {getStyle} from './style.js';
export function animate(obj,cssStyle,time){
	if(time === 'slow'){
		time = 5000;
	}else if(time === 'normal'){
		time = 3000;
	}else if(time === 'fast'){
		time = 1500;
	}
	var timer;
	var end;
	var action;
	var animate = new Promise(function(resolve,reject){
		var timerIndex = 0;
		var attrName = [],
			attrOldVal = [],
			attrNewVal = [],
			attrFrontString = [],
			attrBehindString = [],
			attrSpeed = [],
			attrDir = [];
		for(let attr in cssStyle){
			attrName.push(attr);
			let regExp = /\d/;
			let styleOldValue = getStyle(obj,attr);
			let oldVal = parseFloat(styleOldValue.substring(styleOldValue.search(regExp)));
			oldVal = oldVal || 0;
			attrOldVal.push(oldVal);
			let styleNewValue = cssStyle[attr];
			let newVal = parseFloat(styleNewValue.substring(styleNewValue.search(regExp)));
			attrNewVal.push(newVal);
			regExp = /^\D*/;
			let frontString = regExp.exec(cssStyle[attr])[0];
			attrFrontString.push(frontString);
			regExp = /\D*$/;
			let behindString = attr == 'opacity' ? '' :regExp.exec(cssStyle[attr])[0];
			attrBehindString.push(behindString);
			let speed = (newVal - oldVal) / time * 30;
			attrSpeed.push(speed);
			let dir = speed > 0 ? true : false;
			attrDir.push(dir);
		}
		action = ()=>{
			timerIndex++;
			var changedStyle = ';',
				allSuccess = false;
			attrName.forEach((val,index,arr)=>{
				let styleVal = attrOldVal[index] + attrSpeed[index] * timerIndex;
				if(attrDir[index]===true){
					let regExp =  /\d/;
					let styleNowValue = getStyle(obj,val);
					let nowVal = parseFloat(styleNowValue.substring(styleNowValue.search(regExp)));
					if(nowVal >= attrNewVal[index]){
						styleVal = attrNewVal[val];
						allSuccess = true;
					}
				}else{
					let regExp =  /\d/;
					let styleNowValue = getStyle(obj,val);
					let nowVal = parseFloat(styleNowValue.substring(styleNowValue.search(regExp)));
					if(nowVal <= attrNewVal[index]){
						styleVal = attrNewVal[val];
						allSuccess = true;
					}
				}
				//兼容IE8以及以下opacity
				if(val === 'opacity'){
					let styleValIE = (attrOldVal[index] + attrSpeed[index] * timerIndex)*100;
					changedStyle += ';' +  'alpha:(opacity:' + styleValIE + attrBehindString[index] + ');';
				}
				changedStyle += ';' +  attrName[index] + ':' + attrFrontString[index] + styleVal + attrBehindString[index] + ';';
			})
			if(allSuccess){
				allSuccess = null;
				changedStyle = null;
				end();
			}
			obj.style.cssText += changedStyle;
			changedStyle = null;
		}
		end = ()=>{
			clearInterval(timer);
			attrName = null;
			attrOldVal = null;
			attrNewVal = null;
			attrFrontString = null;
			attrBehindString = null;
			attrSpeed = null;
			attrDir = null;
			timer = null;
			timerIndex = null;
			resolve();
			animate.stop = null;
			animate.go = null;
			animate.end = null;
			action = null;
			end = null;
		}
		timer = setInterval(()=>{
			action();
		},30);
	})
	animate.stop = ()=>{
		clearInterval(timer);
	}
	animate.go = ()=>{
		timer = setInterval(()=>{
			action();
		},30);
	}
	animate.end = ()=>{
		end();
	};
	return animate;
}