export function readFileAsText(file){
	if(file instanceof File) {
		return new Promise((resolve,reject)=> {
			let fileReader = new FileReader();
			fileReader.readAsText(file);
			fileReader.onload = ()=> {
				resolve(fileReader.result);
			}
			fileReader.onerror = ()=> {
				reject(fileReader.error);
			}
		});
	}
}
export function readCsvFile(file){
  if(file instanceof File) {
    return new Promise((resolve,reject)=>{
      let reader = new FileReader();
      reader.readAsText(file);
      let data;

      reader.onerror = ()=>{
        reject(reader.error);
      }
      reader.onabort = ()=>{
        reject('读取被中断');
      }
      reader.onload = ()=>{
        data = reader.result.trim();
        let regExp = /\r\n/;
        let result = data.split(regExp);
        if(result.length < 2){
          regExp = /\r|\n/;
          result = data.split(regExp);
        }
        result = result.map((val,index,arr)=>{
          return arr[index].split(',');
        })
        resolve(result);
      }
    })
  }
}