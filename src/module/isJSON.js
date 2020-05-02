export function isJSON(str) {
	if(typeof str === 'string'){
		try{
		    obj = JSON.parse(str);
		    if(typeof obj === 'object' && obj){
		    	return true;
		    }else{
			    return false;
		    }
	    }catch(error){
	    	return false;
	    }
	}else{
		return false;
    }
}