export class Queue {
    constructor() {
        this.head = undefined;
        this.tail = undefined;
        this.length = 0;
    }
    enqueue(item) {
        // 如果没有 tail，队列为空
        if(this.tail) {
            // 有，则向队尾添加项目
            const queueItem = { value: item, prev: this.tail, next: undefined };
            this.tail.next = queueItem;
            this.tail = queueItem;
        }else {
            const queueItem = { value: item, prev: undefined, next: undefined };
            this.head = queueItem;
            this.tail = queueItem;
        }
        this.length += 1;
    }
    dequeue() {
        const length = this.length;
        if (length === 0) {
            return;
        }
        // 取出项目
        const item = this.head;

        // 长度为1，那么首尾是相同的
        if(length === 1) {
            this.head = undefined;
            this.tail = undefined;
        } else {
            // 大于1了，则正常动作
            const nextItem = item.next;
            // 设置下一项的上一项为 undefined
            nextItem.prev = undefined;
            this.head = nextItem;
        }

        this.length -= 1;

        // 以防万一，清除引用
        item.next = undefined;

        return item.value;
    }
    size() {
        return this.length;
    }
}