// 使用 map 是因为 object 的删除性能过低,map 的删除性能好, 并且 map 自带 size 属性
export class Queue {
    constructor() {
        this.headIndex = 0;
        this.tailIndex = 0;
        this.queue = new Map();
    }
    front() {
        return this.queue.get(this.headIndex);
    }
    enqueue(item) {
        // 向队尾添加项目
        return this.queue.set(this.tailIndex++, item);
    }
    dequeue() {
        if (this.isEmpty()) {
            return;
        }
        // 从队首取出项目
        let item = this.front();
        // 删除队首项目
        this.queue.delete(this.headIndex++)
        return item;
    }
    isEmpty() {
        return this.queue.size <= 0;
    }
    size() {
        return this.queue.size;
    }
}