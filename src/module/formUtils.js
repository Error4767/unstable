// 过滤数字输入
export function filterNumberInput(input, {
  // 默认不允许输入负数
  allowNegative = false,
  // 默认允许小数
  allowDecimals = true,
  // 默认允许至多3个小数位
  maxDecimalPlaces = 3,
  // 默认最大整数7位
  maxIntegerDigits = 7,
} = {}) {
  // 空则仍返回空
  if(String(input).length === 0) {
    return undefined;
  }
  let inputNumber = Number(input);
  // 输入了非数字
  if(input && Number.isNaN(inputNumber)) {
    return undefined;
  }
  // 负数检测
  if(!allowNegative && inputNumber < 0) {
    return 0;
  }
  // 如果不允许小数，直接取整返回
  if(!allowDecimals) {
    return Math.floor(Number(input.substring(0, maxIntegerDigits)));
  }
  const numberPart = String(input).split(".");
  let resultString;
  // 超过一个，证明是输入了小数部分
  if(numberPart.length > 1) {
    // 返回允许输入的最大位数的数字
    resultString = `${numberPart[0].substring(0, maxIntegerDigits)}.${numberPart[1].substring(0, maxDecimalPlaces)}`;
  }else {
    // 没有小数部分，直接返回
    resultString = input.substring(0, maxIntegerDigits);
  }
  const result = Number(resultString);
  // 长度不同，可能是转数字过程中出现了0, 就返回string，否则number
  return String(result).length !== resultString.length ? resultString : result;
}

export function onChangeToNumber(v) {
  if(String(v).length > 0) {
    return Number(v);
  };
  return v;
}