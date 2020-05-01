const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;
const getType = (obj)=> {
	return Object.prototype.toString.call(obj);
}
const objTypes = {
	'[object Object]': true,
	'[object Array]': true,
	'[object Map]': true,
	'[object Set]': true,
	'[object Arguments]': true
}
const {
	objectType,
	arrayType,
	mapType,
	setType,
	argumentsType,
	booleanType,
	stringType,
	numberType,
	dateType,
	errorType,
	regExpType,
	functionType
}
	= {
	objectType: '[object Object]',
	arrayType: '[object Array]',
	mapType: '[object Map]',
	setType: '[object Set]',
	argumentsType: '[object Arguments]',

	booleanType: '[object Boolean]',
	stringType: '[object String]',
	numberType: '[object Number]',
	dateType: '[object Date]',
	errorType: '[object Error]',
	regExpType: '[object RegExp]',
	functionType: '[object Function]'
}
const copyObjectAndArray = (target,weakmap)=> {
	if(typeof target === 'object') {
		let res = Array.isArray(target) ? [] : {};
		for(let key in target){
			if(!target.hasOwnProperty(key)) {
				return;
			}
			if(!isObject(target[key])) {
				res[key] = target[key];
			}else {
				res[key] = deepCopy(target[key], weakmap);
			}
		}
		return res;
	}
}
const copyMap = (target,weakmap)=> {
	let map = new Map();
	if(target instanceof Map) {
		target.forEach((v,k)=> {
			if(!isObject(v)) {
				map.set(k, v);
			}else {
				map.set(k, deepCopy(v, weakmap));
			}
		})
		return map;
	}else {
		throw new TypeError('target is a not map');
	}
}
const copySet = (target,weakmap)=> {
	let set = new Set();
	if(target instanceof Set) {
		target.forEach((v)=> {
			let type = getType(v);
			if(!isObject(v)) {
				set.add(v);
			}else{
				set.add(deepCopy(v, weakmap));
			}
		})
		return set;
	}else {
		throw new TypeError('target is a not set');
	}
}
const copyArguments = (target,weakmap)=> {
	return copyObjectAndArray(Array.from(target), weakmap);
}
const copyRegExp = (target)=> {
	let {source, flags} = target;
	return new RegExp(source, flags);
}
const copyFunction = (target)=> {
	if(typeof target === 'function') {
		if(!target.prototype){
			return target;
		}

		const functionString =  target.toString(),
			bodyReg = /(?<={)(.|\n)+(?=})/m,
			paramReg = /(?<=\().+(?=\)\s+{)/,
			body = bodyReg.exec(functionString),
			param = paramReg.exec(functionString);
		if(!body) {
			return null;
		}
		if(param) {
			param = param[0].split(',');
			return new Function(...param, body[0]);
		}else {
			return new Function(body[0]);
		}
	}else {
		throw new TypeError('target is a not function');
	}
}
const deepCopy = (target, weakmap = new WeakMap())=> {
	if(!isObject(target)) {
		return target;
	}
	if(weakmap.get(target)) {
		return target;
	}
	weakmap.set(target, true);
	const type = getType(target);
	const Ctor = target.constructor;
	let copy;
	switch (type) {
		case objectType:
			copy = copyObjectAndArray(target, weakmap);
			break;
		case arrayType:
			copy = copyObjectAndArray(target, weakmap);
			break;
		case mapType:
			copy = copyMap(target, weakmap);
			break;
		case setType:
			copy = copySet(target, weakmap);
			break;
		case argumentsType:
			copy = copyArguments(target, weakmap);
			break;
		case stringType:
			copy = new Object(Object.prototype.valueOf.call(target));
			break;
		case numberType:
			copy = new Object(Object.prototype.valueOf.call(target));
			break;
		case booleanType:
			copy = new Object(Object.prototype.valueOf.call(target));
			break;
		case dateType:
			copy = new Ctor(target);
			break;
		case errorType:
			break;
		case regExpType:
			copy = copyRegExp(target);
			break;
		case functionType:
			copy = copyFunction(target);
			break;
		default:
			copy = new Ctor(target);
	}
	return copy;
}
export {
	deepCopy
}