let bits = [['十', '百', '千', '万', '十', '百', '千', '亿'],["拾","佰","仟","万","拾","佰","仟","亿"]];
let ints = [["零","一","二","三","四","五","六","七","八","九"],["零","壹","贰","叁","肆","伍","陆","柒","捌","玖"]];
let point = ['点', '點'];
function numberToChinese(num, font = 0) {
  if(typeof num !== 'number') {
    return Error('num is a not Number');
  }
  if(font !== 0 && font !== 1) {
    return Error('font is invalid');
  }
  let numStr = String(num);
  let resArr = [];
  let power = null;
  let bit = bits[font];
  let int = ints[font];
  if(numStr.indexOf('e+') !== -1) {
    let arr = numStr.split('e+');
    numStr = arr[0];
    power = '乘以' + bit[0] + '的' + numberToChinese(parseInt(arr[1]), font) + '次方';
  };
  let [intArr, floatArr] = numStr.split('.').map((v)=> v.split(''));
  if(floatArr) {
    floatArr.forEach((v)=> {
      resArr.unshift(int[parseInt(v)]);
    });
    resArr.push(point[font]);
  }
  intArr.forEach((v, i, a)=> {
    let currentIndex = (intArr.length - 1) - i;
    let value = intArr[currentIndex];
    i = (i - 1) % 8;
    let resBit = bit[i] || '';
    if(value === 0) {
      resArr.push(int[parseInt(value)]);
    }else {
      resArr.push(resBit, int[parseInt(value)]);
    }
  })
  resArr = resArr.reverse();
  let res = resArr.reduce((o, n)=> {
    return o + n;
  },'');
  if(power !== null) {
    res += power;
  }
  return res;
}
export {
  numberToChinese
}