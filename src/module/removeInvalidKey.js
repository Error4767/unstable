export function removeInvalidKey(variable,removeZero = false) {
	if(variable && typeof variable === 'object'){
		if(variable instanceof Array){
			let result = variable.filter(function(value,index,array){
				if(array[index]){
					return true;
				}else{
					if(removeZero === false && array[index] === 0){
						return true;
					}
					return false;
				}
			});
			return result;
		}else{
			if(variable instanceof Object){
				for(let key in variable){
					if(variable[key]){
					}else{
						if(variable[key] != 0 ||variable[key] === ''){
							delete variable[key];
						}else{
							if(retainZero === false){
								delete variable[key];
							}
						}
					}
				}
				return variable;
			}
		}
	}
}