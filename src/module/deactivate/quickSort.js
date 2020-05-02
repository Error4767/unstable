function quickSort(arr,attr,typeFrom = 'attr',left = 0,right = arr.length - 1){
	if(typeFrom === 'attr'){
		if(left>=right){return};
		let i = left,
			j = right,
			pivot = arr[left];
		while(i != j){
			console.log(arr[i],arr[j]);
			while(i<j && arr[j][attr] >= pivot[attr]){j--};
			while(i<j && arr[i][attr] <= pivot[attr]){i++};
			if(i<j){
			let temp = arr[j];
			arr[j] = arr[i];
			arr[i] = temp;
			}
		}
		arr[left] = arr[i];
		arr[i] = pivot;
		quickSort(arr,attr,'attr',left,i-1);
		quickSort(arr,attr,'attr',i+1,right);
	}
}
export {
	quickSort
}