## unstable
>unstable是一个工具库，正如其名，是不稳定的，请不要在生产环境中使用，仅供实验性开发和探索使用

<br />

### 安装
````
  npm install unstable
````

<br />

### 标志
下文所有参数类型加?为可选参数, 在代码中函数后方加的注释均为返回值

<br />

### 基本函数
  
<br />

#### isObject
>检测目标是否是对象
  
(any) -> boolean  
参数: (任意)
````javascript
import { isObject } from "unstable";
isObject({}); // true
isObject([]); // true
isObject("string"); // false
isObject(null); // false
````

<br />

#### typeOf
>获取目标的具体类型，值从 Object.prototype.toString 返回的结果中截取
  
(any) -> string  
参数：(任意)
````javascript
import { typeOf } from "unstable";
typeOf({}); // "Object"
typeOf([]); // "Array"
typeOf(new Map()); // "Map"
typeOf(new Set()); // "Set"
typeOf(new Promise(()=> {})); // "Promise"
typeOf(new Error()); // "Error"
typeOf(/\\/); // "RegExp"
// ...
````

<br />

#### merge
>深度合并多个对象，不同于Object.assign，基本示例如下
  
(Array\<object\>) -> object  
参数: (包含多个对象的数组)  
````javascript
import { merge } from "unstable";
merge(
  [
    { a: 1, b: 2, c: 3 },
    { a:2, d: 5 },
    { b: 3, g: 7 }
  ]
);
/*
  {a: 2, b: 3, c: 3, d: 5, g: 7}
*/
````

<br />

#### isJSON
>检测是否是json  
  
(string) -> boolean  
参数：(要检测的字符串)  

<br />

#### deepCopy
>深复制  
  
(object) -> object  
参数：(要深复制的对象)  

<br />

#### debounce
>防抖  
  
(function, number, object?) -> function  
参数: (要防抖的函数, 最大间隔, this对象?);
````javascript
import { debounce } from "unstable";
let debounced = debounce(function() {}, 100, {a: 1});
````

<br />

#### throttle
>节流  
  
(function, number, object?) -> function  
参数: (要节流的函数, 最大间隔, this对象?);
````javascript
import { throttle } from "unstable";
let throttled = throttle(function() {}, 100, {a: 1});
````

<br />

#### once
>包装单次运行的函数  
  
(function, object?) -> function  
参数: (要单次运行的函数, this对象?);
````javascript
import { once } from "unstable";
let onced = once(()=> console.log("runed"));
onced(); // "runed"
onced(); // 
````

<br />

### 浏览器可用函数

<br />

#### loadJs
>从给定的源加载一个js文件
  
(string) -> void  
参数：(uri地址)

<br />

#### removeElement
>删除目标元素
  
(element) -> void  
参数：(要删除的元素)

<br />

#### style方法
>获取和设置style
  
##### getStyle
(element, string) -> string  
参数：(DOM元素, 样式名)
##### setStyle
(element, object) -> string  
参数：(DOM元素, 样式对象)
````javascript
import { setStyle } from "unstable";
setStyle(element/* 目标元素 */, {
  width: "100px",
  height: "100px",
  "z-index": "10" 
});
````

<br />

#### cookie方法
>读写cookie
  
##### getCookie
(string) -> string  
##### setCookie
(string, string, number) -> void  
````javascript
import { getCookie, setCookie } from "unstable";
// 设置 cookie 的方法，第三个参数单位：天
setCookie("key", "value", 1); 
getCookie("key"); // "value"
````

<br />

#### readFileAsText
>读取文件中的文本内容
  
(file) -> Promise\<string\>  
参数：(从input标签中获取的文件)

<br />

#### drag
> 使目标元素可拖动到任意位置
  
(element) -> void  
参数：(DOM元素)

<br />

### 额外函数

<br />

#### compileXMLToAST
>将XML编译为AST，基础示例如下，[在线使用](https://ecuder.cn/CompileXML)
  
(string) -> object  
参数：(XML字符串)
````javascript
import { compileXMLToAST } from "unstable";
// <></>表示Fragment
compileXMLToAST(`
<>
  <input>
  <br />
  <div class="container">
    <span>content</span>
  </div>
</>
`);/*
{
  "props": {},
  "type": "Fragment",
  "nodeName": "",
  "children": [
    {
      "props": {},
      "type": "Tag",
      "nodeName": "input"
    },
    {
      "props": {},
      "type": "Tag",
      "nodeName": "br"
    },
    {
      "props": {
        "class": "container"
      },
      "type": "Tag",
      "nodeName": "div",
      "children": [
        {
          "props": {},
          "type": "Tag",
          "nodeName": "span",
          "children": [
            {
              "type": "String",
              "value": "content"
            }
          ]
        }
      ]
    }
  ]
}
*/
````

<br />

#### createElement
>根据compileXMLToAST返回的对象创建元素及其子元素，返回创建的元素
  
(object)-> element  
参数：(compileXMLToAST返回的对象)

<br />

#### reactivity 相关
>这些功能与vue reactivity功能大致相同，
实现了
  ref,
	isRef,
	reactive,
	shallowReactive,
	isReactive,
	readonly, 
	shallowReadonly,
	isReadonly,
	watch,
	watchEffect,
	computed  
参考[vue reactivity 文档](https://v3.cn.vuejs.org/guide/reactivity-fundamentals.html#%E5%A3%B0%E6%98%8E%E5%93%8D%E5%BA%94%E5%BC%8F%E7%8A%B6%E6%80%81)

#### scheduler 相关
用于根据优先级调度任务的执行，减少因执行卡顿导致浏览器阻塞  
当任务未到过期时间，如果浏览器需要渲染，则中断调度，待浏览器渲染后，任务将继续执行，这可以避免阻塞用户交互  
当同时有多个任务，高优先级任务会优先执行，低优先级任务会被排在后面  
##### schedulePriorityCallback
(number, function) -> void  
参数：(优先级变量, 回调函数)

优先级变量导出  
immediatePriority 立即执行，过期时间 -1ms  

userBlockingPriority 用户阻塞优先级，过期时间 250ms  

normalPriority 一般优先级，过期时间 1000ms  

lowPriority 低优先级，过期时间 10000ms  

idlePriority 空闲优先级，过期时间 1073741823ms (v8最大整数)  
  