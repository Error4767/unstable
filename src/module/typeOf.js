export function typeOf(value) {
  let type = Object.prototype.toString.call(value, null);
  type = type.substring(8, type.indexOf(']'));
  return type;
}