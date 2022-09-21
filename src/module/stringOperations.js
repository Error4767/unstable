export function replaceRight(string, replacedSting, replaceString) {
  const startIndex = string.lastIndexOf(replacedSting);
  if(startIndex !== -1) {
    const front = string.slice(0, startIndex);
    // 原来的字符串
    const backed = string.slice(startIndex + replacedSting.length);
    return front + replaceString + backed;
  }else {
    return string;
  }
}