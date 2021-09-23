export class Heap {
    constructor(
        compareFunction
        /* 
            必须的比较函数，用于比较两者大小
            (node1, node2)=> boolean
            如果 node1 大于 node2 就返回 true 则表示 node1 排在 node2 上面 （大顶堆），反之石下面（小顶堆）
         */
    ) {
        if (!compareFunction || typeof compareFunction !== "function") {
            throw new Error("compare function must be a function");
        }
        this.heap = [];
        // 设置比较函数
        this.compareFunction = compareFunction;
    }
    push(item) {
        if (this.heap.length === 0) { // 首次插入
            this.heap.push(item);
        } else {// 不是首次插入，就需要保持堆的性质
            this.heap.push(item);
            const newItemIndex = this.heap.length - 1;
            const parentIndex = Math.floor((newItemIndex - 1) / 2);
            this.heapify(parentIndex, "top");
        }
    }
    // 交换节点
    swap(i, i2) {
        let iValue = this.heap[i];
        this.heap[i] = this.heap[i2];
        this.heap[i2] = iValue;
    }
    heapify(index, mode /* string: "top" | "bottom" */) {
        // 调整节点
        // 最大值节点的索引
        let largestItemIndex = index;
        // 左子节点
        const leftChildIndex = index * 2 + 1;
        // 右子节点
        const rightChildIndex = index * 2 + 2;

        const { heap, compareFunction } = this;
        const heapLength = heap.length;

        if (leftChildIndex < heapLength && compareFunction(heap[leftChildIndex], heap[largestItemIndex])) {
            largestItemIndex = leftChildIndex;
        }
        if (rightChildIndex < heapLength && compareFunction(heap[rightChildIndex], heap[largestItemIndex])) {
            largestItemIndex = rightChildIndex;
        }
        if (largestItemIndex !== index) {
            this.swap(largestItemIndex, index);
            // 调整堆
            if (mode === "top") {
                // 自下向上
                if (index !== 0) {
                    this.heapify(Math.floor((index - 1) / 2), mode);
                }
            } else if (mode === "bottom") {
                // 自上向下
                // 因为已经交换位置，所以此处 largest 是被交换的子节点的位置
                this.heapify(largestItemIndex, mode);
            }
        }
    }
    pop() {
        const heap = this.heap;
        // 首位交换
        this.swap(0, heap.length - 1);
        // 取出节点
        let item = this.heap.pop();
        // 保持堆的性质
        this.heapify(0, "bottom");
        return item;
    }
}