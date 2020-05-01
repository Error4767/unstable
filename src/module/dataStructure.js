class Stack{
  constructor(){
    this.items = [];
  }
  push(eve){
    this.items.push(eve);
  }
  peek(){
    return this.items[this.items.length-1];
  }
  pop(){
    return this.items.pop();
  }
  size(){
    return this.items.length;
  }
  isEmpty(){
    return this.items.length === 0;
  }
  toString(){
    let str = '';
    for(let value of this.items){
      str += value + ',';
    }
    str = str.substring(0,str.length-1);
    return str;
  }
}
class Queue{
  constructor(){
    this.items = [];
  }
  enqueue(eve){
    this.items.push(eve);
  }
  front(){
    return this.items[0];
  }
  dequeue(){
    return this.items.shift();
  }
  size(){
    return this.items.length;
  }
  isEmpty(){
    return this.items.length === 0;
  }
  toString(){
    let str = '';
    for(let value of this.items){
      str += value + ',';
    }
    str = str.substring(0,str.length-1);
    return str;
  }
}
class PriorityQueue{
  constructor(){
    this.items = [];
  }
  enqueue(eve,priority){
    let queueElement = {
      element:eve,
      priority:priority
    };
    if(this.items.length === 0){
      this.items.push(queueElement);
    }else{
      let added = false; 
      for(let i = 0,length = this.items.length;i<length;i++){
        if(queueElement.priority < this.items[i].priority){
          this.items.splice(i,0,queueElement)
          added = true;
          break;
        }
      }
      if(!added){
        this.items.push(queueElement);
      }
    }
  }
  front(){
    return this.items[0];
  }
  dequeue(){
    return this.items.shift();
  }
  size(){
    return this.items.length;
  }
  isEmpty(){
    return this.items.length === 0;
  }
  toString(){
    let str = '';
    for(let i = 0,length = this.items.length;i < length;i++){
      str += this.items[i].value + '_' + this.items[i].priority + ',';
    }
    str = str.substring(0,str.length-1);
    return str;
  }
}
function LinkedList(){
  function Node(data){
    this.data = data;
    this.next = null;
  }
  this.head = null;
  this.length = 0;
  LinkedList.prototype.append = function(data){
    let newNode = new Node(data);
    if(this.length === 0){
      this.head = newNode;
      this.length += 1;
    }else{
      let current = this.head;
      while(current.next){
        current = current.next;
      }
      current.next = newNode;
      this.length += 1;
    }
  }
  LinkedList.prototype.insert = function(position,data){
    if(position < 0 || position >= this.length){
      return false;
    }
    let newNode = new Node(data);
    if(position === 0){
      newNode.next = this.head;
      this.head = newNode;
      this.length += 1;
    }else{
      let current = this.head;
      let index = 0;
      while(index++ < position - 1){
        current = current.next;
      }
      newNode.next = current.next;
      current.next = newNode;
      this.length += 1;
    }
  }
  LinkedList.prototype.get = function(position){
    if(position < 0 || position >= this.length){
      return null;
    }
    let current = this.head;
    let index = 0;
    while(index++ < position){
      current = current.next;
    }
    return current.data;
  }
  LinkedList.prototype.indexOf = function(data){
    let current = this.head;
    let index = 0;
    if(current.data === data){
        return index;
    }
    while(current){
      if(current.data === data){
        return index;
      }
      current = current.next;
      index+=1;
    }
    return -1;
  }
  LinkedList.prototype.update = function(position,data){
    if(position < 0 || position >= this.length){
      return null;
    }
    let current = this.head;
    let index = 0;
    while(index++ < position){
      current = current.next;
    }
    let oldData = current.data;
    current.data = data;
    return oldData;
  }
  LinkedList.prototype.removeAt = function(position){
    if(position < 0 || position >= this.length){
      return false;
    }
    var removedElement;
    if(position === 0){
      removedElement = this.head.data;
      this.head = this.head.next;
      this.length -= 1;
    }else{
      let current = this.head;
      let index = 0;
      while(index++ < position - 1){
        current = current.next;
      }
      removedElement = current.next.data;
      current.next = current.next.next;
      this.length -= 1;
    }
    return removedElement;
  }
  LinkedList.prototype.remove = function(data){
    return this.removeAt(this.indexOf(data));
  }
  LinkedList.prototype.size = function(){
    return this.length;
  }
  LinkedList.prototype.isEmpty = function(){
    return this.length === 0;
  }
  LinkedList.prototype.toString = function(){
    if(this.length === 0){
      return '';
    }
    let str = '';
    let current = this.head;
    let index = 0;
    while(current){
      if(index++ < this.length){
        str += current.data + ',';
        current = current.next;
      }else{
        break;
      }
    }
    str = str.substring(0,str.length - 1);
    return str;
  }
}

function DoublyLinkedList(){
  function Node(data){
    this.data = data;
    this.next = null;
    this.prev = null;
  }
  this.head = null;
  this.tail = null;
  this.length = 0;
  DoublyLinkedList.prototype.append = function(data){
    let newNode = new Node(data);
    if(this.length === 0){
      this.head = newNode;
      this.tail = newNode;
    }else{
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length += 1;
  }
  DoublyLinkedList.prototype.insert = function(position,data){
    if(position < 0 || position >= this.length){
      return false;
    }
    let newNode = new Node(data);
    if(this.length === 0){
      this.head = newNode;
      this.tail = newNode;
    }else{
      if(position === 0){
        newNode.next = this.head;
        this.head.prev = newNode;
        this.head = newNode;
        this.length += 1;
      }else if(position === this.length){
        newNode.prev = this.tail;
        this.tail.next = newNode;
        this.tail = newNode;
      }else{
        let current = this.head;
        let index = 0;
        while(index++ < position){
          current = current.next;
        }
        newNode.next = current;
        newNode.prev = current.prev;
        current.prev.next = newNode;
        current.prev = newNode;
      }
    }
    this.length += 1;
  }
  DoublyLinkedList.prototype.get = function(position){
    if(position < 0 || position >= this.length){
      return null;
    }
    let current = this.head;
    let index = 0;
    while(index++ < position){
      current = current.next;
    }
    return current.data;
  }
  DoublyLinkedList.prototype.indexOf = function(data){
    let current = this.head;
    let index = 0;
    if(current.data === data){
        return index;
    }
    while(current){
      if(current.data === data){
        return index;
      }
      current = current.next;
      index+=1;
    }
    return -1;
  }
  DoublyLinkedList.prototype.update = function(position,data){
    if(position < 0 || position >= this.length){
      return null;
    }
    let current = this.head;
    let index = 0;
    while(index++ < position){
      current = current.next;
    }
    let oldData = current.data;
    current.data = data;
    return oldData;
  }
  DoublyLinkedList.prototype.removeAt = function(position){
    if(position < 0 || position >= this.length){
      return null;
    }
    var removedElement;
    if(this.length === 1){
      removedElement = this.head.data;
      this.head = null;
      this.tail = null;
    }else if(position === 0){
      removedElement = this.head.data;
      this.head.next.prev = null;
      this.head = this.head.next;
    }else if(position === this.length - 1){
      removedElement = this.tail.data;
      this.tail.prev.next = null;
      this.tail = this.tail.prev;
    }else{
      let current = this.head;
      let index = 0;
      while(index++ < position){
        current = current.next;
      }
      current.prev.next = current.next;
      current.next.prev = current.prev;
      removedElement = current.data;
    }
    this.length -= 1;
    return removedElement;
  }
  DoublyLinkedList.prototype.remove = function(position){
    return this.removeAt(this.indexOf(position));
  }
  DoublyLinkedList.prototype.size = function(){
    return this.length;
  }
  DoublyLinkedList.prototype.isEmpty = function(){
    return this.length === 0;
  }
  DoublyLinkedList.prototype.getHead = function(){
    return this.head;
  }
  DoublyLinkedList.prototype.getTail = function(){
    return this.tail;
  }
  DoublyLinkedList.prototype.toString = function(){
    if(this.length === 0){
      return '';
    }
    let str = '';
    let current = this.head;
    let index = 0;
    while(current){
      if(index++ < this.length){
        str += current.data + ',';
        current = current.next;
      }else{
        break;
      }
    }
    str = str.substring(0,str.length - 1);
    return str;
  }
}

class HashTable{
  constructor(size){
    this.storage = [];
    this.count = 0;
    this.limit = size || 47;
  }
  isPrime(num){
    let temp = Math.sqrt(num);
    for(let i = 2,length = Math.floor(temp);i<=length;i++){
      if(num % i === 0){
        return false;
      }
    }
    return true;
  }
  getPrime(num){
    while(!this.isPrime(num)){
      num+=1;
    }
    return num;
  }
  hashFunc(str,size){
    let hashCode = 0;
    for(let i = 0,length = str.length;i<length;i++){
      hashCode  = 37 * hashCode + str.charCodeAt(i);
    }
    let index = hashCode % size;
    return index;
  }
  put(key,value){
    let index = this.hashFunc(key,this.limit);
    let link = this.storage[index];
    if(link=== undefined){
      link = [];
      this.storage[index] = link;
    }
    for(let i = 0,length = link.length;i<length;i++){
      if(link[i][0] === key){
        link[i][1] = value;
        return;
      }
    }
    link.push([key,value]);
    this.count += 1;
    if(this.count >= this.limit * 3 / 4){
      this.resize(this.getPrime(this.limit*2));
    }
    return;
  }
  get(key){
    let index = this.hashFunc(key,this.limit);
    let link = this.storage[index];
    if(link=== undefined){
      return;
    }
    for(let i = 0,length = link.length;i<length;i++){
      if(link[i][0] === key){
        return link[i][1];
      }
    }
    return;
  }
  remove(key){
    let index = this.hashFunc(key,this.limit);
    let link = this.storage[index];
    if(link=== undefined){
      return;
    }
    for(let i = 0,length = link.length;i<length;i++){
      if(link[i][0] === key){
        this.count -= 1;
        return link.splice(i,1);
      }
    }
    return;
  }
  isEmpty(){
    return this.count === 0;
  }
  size(){
    return this.count;
  }
  resize(limit){
    var oldStorage = this.storage;
    this.storage = [];
    this.limit  = limit;
    this.count = 0;
    oldStorage.forEach((val,i,arr)=>{
      if(val instanceof Array === true){
        val.forEach((val2,i2,arr2)=>{
          this.put(val[i2][0],val[i2][1]);
        })
      }
    })
    oldStorage = null;
  }
}
class Set{
  constructor(){
    this.items = {};
  }
  add(val){
    if(this.has(this.items[val])){
      return false;
    }
    this.items[val] = val;
    return true;
  }
  has(val){
    return this.items.hasOwnProperty(val);
  }
  remove(val){
    if(!this.has(this.items[val])){
      return false;
    }
    delete this.items[val];
    return true;
  }
  clear(){
    this.items = {};
  }
  size(){
    return Object.keys(this.items).length;
  }
  values(){
    return Object.keys(this.items);
  }
  isEmpty(){
    return Object.keys(this.items).length === 0;
  }
  union(otherSet){
    if(otherSet instanceof Set === true){
      return {...otherSet.items,...this.items}
    }
  }
  intersection(otherSet){
    let newSet = new Set();
    for(let key in this.items){
      if(otherSet.has(key)){
        newSet.add(this.items[key]);
      }
    }
    return newSet;
  }
  difference(otherSet){
    let newSet = new Set();
    for(let key in this.items){
      if(!otherSet.has(key)){
        newSet.add(this.items[key]);
      }
    }
    return newSet;
  }
  subSet(otherSet){
    for(let key in otherSet.items){
      if(!this.has(key)){
        return false;
      }
    }
    return true;
  }
}
class BinarySearchTree{
  constructor(){
    this.root = null;
  }
  createNode(key,value){
    return {
      key:key,
      value:value,
      left:null,
      right:null
    };
  }
  insert(key,value){
    var newNode = this.createNode(key,value);
    if(this.root === null){
      this.root = newNode;
    }else{
      let current = this.root;
      while(true){
        if(newNode.key === current.key){
          current.value = newNode.value;
          break;
        }
        if(newNode.key < current.key){
          if(current.left == null){
            current.left = newNode;
            break;
          }else{
            current = current.left;
          }
        }else{
          if(current.right == null){
            current.right = newNode;
            break;
          }else{
            current = current.right;
          }
        }
      }
    }
  }
  insertNode(node,newNode){
    // 插入元素递归方法，由于效率不如while高暂时停用
    if(newNode.key === node.key){
      node.value  = newNode.value;
      return;
    }
    if(newNode.key < node.key){
        if(node.left == null){
          node.left = newNode;
        }else{
          this.insertNode(node.left,newNode);
        }
    }else{
      if(node.right == null){
        node.right = newNode;
      }else{
        this.insertNode(node.right,newNode);
      }
    }
  }
  orderTraversalNode(node,handler,order){
    if(node !== null){
      if(order === 'pre'){
        handler(node.value,node.key,this.root);
      }
      this.orderTraversalNode(node.left,handler,order);
      if(order === 'middle'){
        handler(node.value,node.key,this.root);
      }
      this.orderTraversalNode(node.right,handler,order);
      if(order === 'post'){
        handler(node.value,node.key,this.root);
      }
    }
  }
  preOrderTraversal(handler){
    this.orderTraversalNode(this.root,handler,'pre');
  }
  middleOrderTraversal(handler){
    this.orderTraversalNode(this.root,handler,'middle');
  }
  postOrderTraversal(handler){
    this.orderTraversalNode(this.root,handler,'post');
  }
  search(key){
    let root = this.root;
    if(root){
      if(root.key === key){
        return root;
      }else{
        let current = root;
        let result = false;
        while(current !== null){
          if(key === current.key){
            result = current;
            break;
          }else if(key < current.key){
            current = current.left;
          }else if(key > current.key){
            current = current.right;
          }
        }
        if(result){
          return result.value;
        }
        return result;
      }
    }
    return false;
  }
  getNodeAndParentNode(key){
    let root = this.root;
    if(root.key === key){
      return {
      node:this.root,
        parent:this,
        angel:'root'
      };
    }else{
      let current = root;
      let parent = null;
      let angel = null;
      while(current !== null){
        if(key === current.key){
          break;
        }
        if(key < current.key){
          parent = current;
          current = current.left;
          angel = 'left';
        }else if(key > current.key){
          parent = current;
          current = current.right;
          angel = 'right';
        }
      }
      if(current !== null){
        return {
          node:current,
          parent:parent,
          angel:angel
        }
      }else{
        return false;
      }
    }
  }
  searchSuccessor(node){
    if(node.left !== null && node.right !== null){
      let successorNode = node.right,
        current = node.right;
      while(current !== null){
        successorNode = current;
        current = current.left;
      }
      return successorNode;
    }else{
      return false;
    }
  }
  remove(key){
    let nodes = this.getNodeAndParentNode(key);
    if(nodes){
    let {parent,node,angel} = nodes;
    if(node.left === null && node.right === null){
      parent[angel] = null;
      return node.value;
    }else if(node.left !== null && node.right === null){
      parent[angel] = node.left;
      return node.value;
    }else if(node.right !== null && node.left === null){
      parent[angel] = node.right;
      return node.value;
    }else{
      let successorNode = this.searchSuccessor(node);
      if(successorNode){
        if(successorNode.right !== null){
          var successorNodesRight = successorNode.right;
            var {parent:successorNodeParent,angel:successorNodeAngel} = this.getNodeAndParentNode(successorNode.key);
            successorNodeParent[successorNodeAngel] = successorNodesRight;
        }else{
          var {parent:successorNodeParent,angel:successorNodeAngel} = this.getNodeAndParentNode(successorNode.key);
          successorNodeParent[successorNodeAngel] = null;
        }
        
      }
      let [leftNode,rightNode] = [node.left,node.right];
      successorNode.right = rightNode;
      successorNode.left = leftNode;
      parent[angel] = successorNode;
      return node.value;
    }
    }
  }
  max(){
    let node = this.root;
    while(node.right !== null){
      node = node.right;
    }
    return {
      key:node.key,
      value:node.value
    };
  }
  min(){
    let node = this.root;
    while(node.left !== null){
      node = node.left;
    }
    return {
      key:node.key,
      value:node.value
    };
  }
}
class RedBlackTree{
  constructor(){
    this.root = null;
    this.size = 0;
  }
  createNode(key,value){
    return {
      key:key,
      value:value,
      left:null,
      right:null,
      color:'red'
    };
  }
  //右红左黑
  leftRotate(g){
    let x = g.right;
    g.right = x.left;
    x.left = g;
    x.color = g.color;
    g.color = 'red';
    return x;
  }
  //左红左子红
  rightRotate(g){
    let x = g.left;
    g.left = x.right;
    x.right = g;
    x.color = g.color;
    g.color = 'red';
    return x;
  }
  isRed(node) {
    if(!node){
      return false;
    }
    let color = node.color === 'red' ?  true :  false;
    return color;
  }
  flipColors(node){
    node.color = 'red';
    node.left.color = 'black';
    node.right.color = 'black';
  }
  insert(key,value){
    this.root = this.insertNode(this.root,key,value);
    this.root.color = 'black';
  }
  insertNode(node,key,value){
    if (!node) {
      this.size++;
      return this.createNode(key, value);
    }
    if (key < node.key) {
      node.left = this.insertNode(node.left,key,value);
    } else if (key > node.key) {
      node.right = this.insertNode(node.right,key,value);
    } else {
      node.value = value;
    }

    if (this.isRed(node.right) && !this.isRed((node.left))) {
      node = this.leftRotate(node);
    }
    if (this.isRed(node.left) && this.isRed((node.left.left))) {
      node = this.rightRotate(node);
    }
    if (this.isRed(node.left) && this.isRed(node.right)) {
      this.flipColors(node);
    }
    return node;
  }
  search(key){
    let root = this.root;
    if(root){
      if(root.key === key){
        return root;
      }else{
        let current = root;
        let result = false;
        while(current !== null){
          if(key === current.key){
            result = current;
            break;
          }else if(key < current.key){
            current = current.left;
          }else if(key > current.key){
            current = current.right;
          }
        }
        if(result){
          return result.value;
        }
        return result;
      }
    }
    return false;
  }
  orderTraversalNode(node,handler,order){
    if(node !== null){
      if(order === 'pre'){
        handler(node.value,node.key,this.root);
      }
      this.orderTraversalNode(node.left,handler,order);
      if(order === 'middle'){
        handler(node.value,node.key,this.root);
      }
      this.orderTraversalNode(node.right,handler,order);
      if(order === 'post'){
        handler(node.value,node.key,this.root);
      }
    }
  }
  preOrderTraversal(handler){
    this.orderTraversalNode(this.root,handler,'pre');
  }
  middleOrderTraversal(handler){
    this.orderTraversalNode(this.root,handler,'middle');
  }
  postOrderTraversal(handler){
    this.orderTraversalNode(this.root,handler,'post');
  }
  searchSuccessor(node){
    if(node.left !== null && node.right !== null){
      let successorNode = node.right,
        current = node.right;
      while(current !== null){
        successorNode = current;
        current = current.left;
      }
      return successorNode;
    }else{
      return false;
    }
  }
  max(){
    let node = this.root;
    while(node.right !== null){
      node = node.right;
    }
    return {
      key:node.key,
      value:node.value
    };
  }
  min(){
    let node = this.root;
    while(node.left !== null){
      node = node.left;
    }
    return {
      key:node.key,
      value:node.value
    };
  }
  size(){
    return this.size;
  }
  isEmpty(){
    return this.size === 0 ? true : false;
  }
}

class Graph{
  constructor(){
    this.vertexs = [];
    this.edges = new Map();
    this.edges.weights = new Map();
    this.vertexsSize = 0;
    this.edgesSize = 0;
  }
  addVertex(v){
    this.vertexs.push(v);
    this.edges.set(v,[]);
    this.edges.weights.set(v,[]);
    this.vertexsSize++;
  }
  addEdge(v1,v2,weight = null,hasAngel = false){
    if(hasAngel === true){
      this.edges.get(v1).push(v2);
      this.edges.weights.get(v1).push(weight);
      this.edgesSize++;
    }else{
      this.edges.get(v1).push(v2);
      this.edges.get(v2).push(v1);
      this.edges.weights.get(v1).push(weight);
      this.edges.weights.get(v2).push(weight);
      this.edgesSize++;  
    }
  }
  setEdgeWeight(v1,v2,weight = null){
    let index = this.vertexs.indexOf(v1),
      index2 = this.vertexs.indexOf(v2);
    if(index !== -1 && index2 !== -1){
      if(this.edges.weights.get(v1) && this.edges.weights.get(v2)){
        this.edges.weights.get(v1)[this.edges.get(v1).indexOf(v2)] = weight;
        this.edges.weights.get(v2)[this.edges.get(v2).indexOf(v1)] = weight;
      } 
    }else{
      return null;
    }
  }
  getEdgeWeight(v1,v2){
    // 判断两顶点间边的权重如果没有点或边或权重则返回undefined
    let index = this.vertexs.indexOf(v1),
      index2 = this.vertexs.indexOf(v2);
    if(index !== -1 && index2 !== -1){
      return this.edges.weights.get(v1)[this.edges.get(v1).indexOf(v2)];
    }else{
      return undefined;
    }
  }
  removeEdge(v1,v2){
    let hasV1Edge = this.edges.get(v1).indexOf(v2) !== -1,
      hasV2Edge = this.edges.get(v2).indexOf(v1) !== -1;
    if(hasV1Edge||hasV2Edge){
     if(hasV1Edge){
        var v1Edges = this.edges.get(v1),
          v2Index = v1Edges.indexOf(v2),
          v1Weights = this.edges.weights.get(v1);
        v1Edges.splice(v2Index,1);
        v1Weights.splice(v2Index,1);
      }
      if(hasV2Edge){
        var v2Edges = this.edges.get(v2),
          v1Index = v2Edges.indexOf(v1),
          v2Weights = this.edges.weights.get(v2);
        v2Edges.splice(v1Index,1);
        v2Weights.splice(v1Index,1);
      }
      this.edgesSize--;
    }
  }
  removeAllEdges(v){
    this.edges.get(v).forEach((v2,i,a)=>{
      this.removeEdge(v,v2);
    });
  }
  removeVertex(v){
    let index = this.vertexs.indexOf(v);
    if(index !== -1){
      this.removeAllEdges(v);
      this.edges.delete(v);
      this.vertexs.splice(index,1);
      this.vertexsSize--;
    }
  }
  initColors(){
    let colors = new Map();
    this.vertexs.forEach((v,i,a)=>{
      colors.set(v,'white');
    });
    return colors;
  }
  bfs(startV,handler){
    if(this.vertexs.indexOf(startV) !== -1){
      let colors = this.initColors();
      let queue = new Queue();
      queue.enqueue(startV);
      colors.set(startV,'gray');
      while(queue.size() !== 0){
        let currentV = queue.dequeue();
        this.edges.get(currentV).forEach((v,i,a)=>{
          if(colors.get(v) === 'white'){
            colors.set(v,'gray');
            queue.enqueue(v);
          }
        });
        handler(currentV);
      }
    }
  }
  dfs(startV,handler){
    if(this.vertexs.indexOf(startV) !== -1){
      let colors = this.initColors();
      this.dfsRecursion(startV,colors,handler);
    }
  }
  dfsRecursion(v,colors,handler){
    colors.set(v,'gray');
    handler(v);
    let edge = this.edges.get(v);
    edge.forEach((v2,i,a)=>{
      if(colors.get(v2) === 'white'){
        this.dfsRecursion(v2,colors,handler);
      }
    })
  }
  toString(){
    let resultStr = ``;
    this.vertexs.forEach((v,i,a)=>{
      resultStr += `${v} -->`;
      this.edges.get(v).forEach((v2,k,m)=>{
        let edgeWeight = this.edges.weights.get(v)[this.edges.get(v).indexOf(v2)];
        resultStr += `${v2}(${edgeWeight}) `;
      });
      resultStr += '\n';
    });
    return resultStr;
  }
  size(attr = 'vertex'){
    if(attr === 'vertex'){
      return this.vertexsSize;
    }else if(attr === 'edge'){
      return this.edgesSize;
    }else{
      return false;
    }
  };
  isEmpty(attr = 'vertex'){
    if(attr === 'vertex'){
      return this.vertexsSize === 0;
    }else if(attr === 'edge'){
      return this.edgesSize === 0;
    }else{
      return false;
    }
  }
}
export {
  Stack,
  Queue,
  PriorityQueue,
  LinkedList,
  DoublyLinkedList,
  HashTable,
  Set,
  BinarySearchTree,
  RedBlackTree,
  Graph
}