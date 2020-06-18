export function merge(...objects) {
	if(objects.length <= 1) {
		return objects[0]
	}
	let merged = Object.create(objects[0].__proto__);
	objects.forEach((v)=> {
		if(v === null && typeof v !== 'object') {
			return;
		}
		for(let key in v) {
			if(v.hasOwnProperty(key)) {
				if(typeof v[key] === 'object' && typeof merged[key] === 'object') {
					merged[key] = merge(merged[key], v[key]);
				}else {
					merged[key] = v[key];
				}
			}
		}
	})
	return merged;
}