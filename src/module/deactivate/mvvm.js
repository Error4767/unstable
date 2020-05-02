class Dep {
  constructor(){
    this.subs = [];
  }
  addSub(sub){
    this.subs.push(sub);
  }
  notify(newVal, oldVal){
    this.subs.forEach(sub=>sub.update(newVal, oldVal));
  }
}
class Watcher {
  constructor(vm, attr, callback) {
    this.callback = callback;
    Dep.target = this;
    let attrChain = getAttrChain(attr),
      val = searchValFromAttrsArr(vm,attrChain);
    Dep.target = null;
  }
  update(newVal, oldVal){
    this.callback(newVal, oldVal);
  }
}
function Mvvm(options = {}) {
  this.$options = options;
  let data = this._data = this.$options.data;
  this._computed = this.$options.computed;
  this._watch = this.$options.watch;
  initComputed(this);
  observe(data);
  for(let key in data) {
    Object.defineProperty(this, key, {
      enumerable: true,
      get() {
        return this._data[key];
      },
      set(newVal) {
        this._data[key] = newVal;
      }
    })
  }
  initWatch(this);
  compiler(options.el,this);
}
function isTraversableObject(target) {
  if(typeof target === 'object') {
    if(target instanceof RegExp 
        || target instanceof Date 
        || target instanceof String 
        || target instanceof Number 
        || target instanceof Boolean
        || target instanceof Error) {
      return false;
    }
    return true;
  }else {
    return false;
  }
}
function Observe(data) {
  for(let key in data) {
    let dep = new Dep,
      val = data[key];
    if(typeof val === 'object') {
      Observe(val);
    }else {
      Object.defineProperty(data, key, {
        enumerable: true,
        get() {
          Dep.target && dep.addSub(Dep.target);
          return val;
        },
        set(newVal) {
          let oldVal = val;
          val = newVal;
          observe(val);
          dep.notify(newVal, oldVal);
        }
      })
    }
  }
}
function observe(data){
  if(!isTraversableObject(data)) {return}
  return new Observe(data);
}
function compiler(el,vm) {
  vm.$el = document.querySelector(el);
  let fragment = document.createDocumentFragment();
  let child = null;
  while(child = vm.$el.firstChild) {
    fragment.appendChild(child);
  }
  replace(vm,fragment);
  vm.$el.appendChild(fragment);
}
function initComputed(vm) {
  let computed = vm.$options.computed,
    keys = Object.keys(computed);
  keys.forEach((key)=>{
    let get = typeof computed[key] === 'function' ? computed[key] : computed[key].get
    Object.defineProperty(vm,key,{
      get
    });
  })
}
function initWatch(vm) {
  let watch = vm.$options.watch;
    keys = Object.keys(watch);
  keys.forEach((key)=> {
    if(vm.hasOwnProperty(key)) {
      new Watcher(vm, key, watch[key], false);
    }else {
      throw new Error(key + ' does not exist');
    }
  })
}
function getAttrChain(str) {
  let result = str.split(/[\.(\[)(\])]/).filter((v)=> {
    return v ? true : false;
  })
  return result;
}
function replace(vm,fragment) {
  Array.from(fragment.childNodes).forEach((node)=>{
    if(node.nodeType === 3) {
      let text = node.textContent,
        reg = /(\{\{([^\{])*\}\})/g,
        attrs = text.match(reg);
      if(attrs) {
        if(attrs.length <= 1) {
          let attr = attrs[0].replace(/[\{\}]/g,'').trim();
          let callback = ()=> {
            let attrChain = getAttrChain(attr);
            let newVal = searchValFromAttrsArr(vm, attrChain);
            newVal = toString(newVal);
            node.textContent = text.replace(/\{\{(.*)\}\}/,newVal);
          }
          new Watcher(vm, attr, callback);
          callback();
        }else {
          attrs = attrs
            .map(v=>v.replace(/[\{\}]/g,'').trim());
          let callback = ()=> {
            let newTextContent = text.replace(reg,'{{null}}');
            attrs
              .map(v=>searchValFromAttrsArr(vm, getAttrChain(v)))
              .forEach(v=>{
                newTextContent = newTextContent.replace('{{null}}',v);
              });
            newTextContent = toString(newTextContent);
            node.textContent = newTextContent;
          }
          attrs.forEach((v)=>{
            new Watcher(vm, v, callback);
          });
          callback();
        }
      }
    }
    if(node.nodeType === 1){
      let nodeAttrs = Array.from(node.attributes);
      nodeAttrs.forEach((v)=>{
        let name = v.name,
          value = v.value,
          attrChain = value.split('.');
        if(name.indexOf('v-') !== 0 && name.indexOf(':') !== 0) {
          return;
        }
        node.removeAttribute(name);
        let data = searchValFromAttrsArr(vm,attrChain,attrChain.length - 1),
          attr = attrChain[attrChain.length - 1];
        if(name.indexOf('v-model') === 0) {
          let callback = ()=> {
            node.value = data[attr];
          }
          new Watcher(vm, value, callback);
          node.addEventListener('input',(e)=>{
            data[attr] = e.target.value;
          })
          callback();
        }else if(name.indexOf('v-bind:') === 0 || name.indexOf(':') === 0) {
          let nodeAttr = name.split(':')[1];
          let callback = ()=> {
            node.setAttribute(nodeAttr, data[attr]);
          }
          new Watcher(vm, value, callback);
          callback();
        }
      });
    }
    if(node.childNodes) {
      replace(vm,node);
    }
  })
}
function toString(target) {
  if(typeof target === 'object') {
    let result;
    try {
      result = JSON.stringify(target);
    }catch (err){
      result = target.toString();
    }
    return result;
  }else {
    return target;
  }
}
function searchValFromAttrsArr(obj, attrChain, length = attrChain.length) {
  let returnValueOfcantFind = undefined;
  if(typeof obj !== 'object') {
    return returnValueOfcantFind;
  }
  if(typeof attrChain !== 'object') {
    return returnValueOfcantFind;
  }else {
    if(!attrChain instanceof Array) {
      return returnValueOfcantFind;
    }
  }
  let val = obj;
  if(attrChain.length >= 1) {
    attrChain.every((attr,i)=>{
      if(i < length){
        if(val.hasOwnProperty(attr)) {
          val = val[attr];
          return true;
        }else {
          val = returnValueOfcantFind;
          return false;
        }
      }
    })
  }else {
    if(obj.hasOwnProperty(attrChain[0])) {
      val = obj[attrChain[0]];
    }else {
      return returnValueOfcantFind;
    }
  }
  return val ? val : returnValueOfcantFind;
}
export {
  Mvvm
};