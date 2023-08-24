// ref 标识
export const REF_IDENTIFY = '__isRef';
// 记忆标识
export const MEMOIZED_IDENTIFY = '__memoized';
// computed 标识
export const COMPUTED_IDENTIFY = "__isComputed";
// readyonly 标识
export const READONLY_IDENTIFY = '__isReadonly';

// 原始标识(这个不会存在对象上，会在 proxy getter 中拦截使用)
export const RAW_IDENTIFY = Symbol("__raw");
// 保持原始对象
export const KEEP_RAW_IDENTIFY = Symbol("__keepRaw");