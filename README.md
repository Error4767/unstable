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
  toRef,
  toRefs,
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
当同时有多个任务，过期时间近的任务会被排在前面，过期时间远任务会被排在后面  
当任务到达过期时间，会变成同步（阻塞）执行
##### scheduleExpireCallback
(number, function) -> void  
参数：(过期时间-毫秒, 回调函数)
##### schedulePriorityCallback
(number, function) -> void  
参数：(优先级变量, 回调函数)

优先级变量导出  
immediatePriority 立即执行，过期时间 -1ms  

userBlockingPriority 用户阻塞优先级，过期时间 250ms  

normalPriority 一般优先级，过期时间 1000ms  

lowPriority 低优先级，过期时间 10000ms  

idlePriority 空闲优先级，过期时间 1073741823ms (v8最大整数)  

#### parseq
>一种异步控制流的方式，参考 [douglas-crockford 的 parseq](https://github.com/douglascrockford/parseq) ，但有一些不同，并且提供了一些额外功能
##### 概念
###### callback
一种用于传递异步操作结果的函数，便于理解，称之为回调函数（callback），下面的异步操作的返回值，指这里
(any, any)-> void
参数：(成功的值, 失败的原因)  
返回值: 可选返回一个取消函数，用于取消异步操作  
失败的原因一般来说是 Error 的实例，建议始终是 Error 实例  
>手动调用的时候，如果成功则只传入一个参数作为成功的值，比如 callback(value)  
如果失败就传入两个参数，第一个为undefined,第二个为失败原因，一般返回捕获的Error，比如 callback(undefined, error)
###### requestor
一种接收一个回调函数，一个值的函数，便于理解，称之为请求器（requestor）
(function, any?) -> function?
参数：(回调函数, 初始值)
>请求器一般为自定义的用于异步操作的函数，里面可以有任意异步操作，如果异步操作结束，则调用 callback 结束这个异步操作，调用方式与上述相同，请求器可选返回一个取消函数，用于取消该异步操作，初始值在请求器调用的时候可在内部使用  
##### 静态属性
###### sequenceName
一个Symbol值，只有调用 parallel 方法时候作为函数名称传入时有效，可以让后面的请求器取得前面请求器的结果，和 promise.then(xx).then(xx).then(xx) 类似，前面的结果作为后面的参数值
##### 方法
>下述所有方法均返回一个新的请求器，一旦该请求器内产生错误，则调用其他所有请求器返回的取消方法（如果有的话）  
借助下面的方法可以轻松组合许多请求器，从而产生强大的控制流  
###### parallel
接收一组请求器，返回一个新的请求器 
(Array\<function>, number?, number?, string?) -> function;
参数 (Array\<请求器>, 时间限制?, 并发数?, 函数名称?) -> 请求器;
参数详情  
- Array\<请求器>: 一个请求器数组，包含了一组异步操作，每个请求器符合上述请求器的规范
- 时间限制: 如果超时就会直接创建一个超时错误通过调用 callback(undefined, error) 传出
- 并发数: 同时运行请求器的最大数量
- 函数名称：函数的名称，一般不需要传，仅用于错误信息生成
>该方法的动作类似于 Promise.all , 只要有一个失败，那么就会以这个失败抛出，否则成功
如果函数名称为 parseq.sequenceName ，则请求器串行执行，第一个请求器获取的value是初始值，后面的是前面请求的返回值，并且最后返回最后一个请求器的结果  
否则返回成功结果数组
###### race
和上述 parallel 方法参数相同
>该方法的动作类似于 Promise.race , 只要有一个完成（不论成功或失败），那么就会完成（不论成功或失败）
###### any
和上述 parallel 方法参数相同
>该方法的动作类似于 Promise.any , 只要有一个成功 ，那么就会成功，如果所有的都失败了，则抛出失败
###### allSettled
和上述 parallel 方法参数相同
>该方法的动作类似于 Promise.allSettled , 不论成功或者失败（不超时），都会返回结果数组，如果超时，则返回超时错误
###### sequence
串行执行请求器，会依次执行请求器，并且以前面请求器的结果作为后面请求器的参数
(Array\<function>, number?, string?) -> function;
参数 (Array\<请求器>, 时间限制?, 函数名称?) -> 请求器;
相当于并发数为 1 , 函数名称是 parseq.sequenceName 的 parallel 方法