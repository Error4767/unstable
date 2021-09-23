import { Heap } from "./Heap.js";

// 优先级
const immediatePriority = 1;
const userBlockingPriority = 2;
const normalPriority = 3;
const lowPriority = 4;
const idlePriority = 5;

// 对应优先级过期时间
// 同步优先级
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
// 用户阻塞优先级
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
// 一般优先级
const NORMAL_PRIORITY_TIMEOUT = 1000;
// 低优先级
const LOW_PRIORITY_TIMEOUT = 10000;
// 空闲优先级(如果一直高优先级任务，可能永远不会被执行)
const IDLE_PRIORITY_TIMEOUT = 1073741823; // v8 最大整数

// 获取任务过期相对时间
function timeoutForTaskPriorityLevel(priorityLevel) {
    switch (priorityLevel) {
        case immediatePriority: {
            return IMMEDIATE_PRIORITY_TIMEOUT;
        };
        case userBlockingPriority: {
            return USER_BLOCKING_PRIORITY_TIMEOUT;
        };
        case normalPriority: {
            return NORMAL_PRIORITY_TIMEOUT;
        };
        case lowPriority: {
            return LOW_PRIORITY_TIMEOUT;
        };
        case idlePriority: {
            return IDLE_PRIORITY_TIMEOUT;
        }
    }
}

// 获取当前时间, 惰性载入函数
const getCurrentTime = (() => {
    if (typeof performance === "object" && typeof performance.now === "function") {
        return () => performance.now();
    } else {
        const initialTime = Date.now();
        return () => (Date.now() - initialTime);
    }
})();

// 优先级队列（小顶堆）
// 比较函数
function compareFunction(item1, item2) {
    const item1Time = item1.expirationTime;
    const item2Time = item2.expirationTime
    // 有时精度不高，只能精确到毫秒，此时判断任务id决定先后;
    if (item1Time === item2Time) {
        return item1.taskId >= item2.taskId;
    }
    return item1Time <= item2Time;
}
// 用比较函数初始化堆
const taskQueue = new Heap(compareFunction);

// 消息循环开启
let messageCycleEnable = false;
// 任务调度运行中
let taskScheduling = false;

let taskId = 0;

// 调度 task
function scheduleTask() {
    taskScheduling = true;
    let task = taskQueue.pop();

    if (!task) {
        taskScheduling = false;
        return;
    }
    // 任务过期，需要立即执行
    while (task && getCurrentTime() >= task.expirationTime) {
        task.callback();
        // 取出新任务
        task = taskQueue.pop();
    }

    if (!task) {
        taskScheduling = false;
        return;
    }
    // 将可延期任务添加到消息循环中
    taskQueue.push(task);

    // 没有过期任务
    requestIdleCallback((idleDeadline) => {
        if (idleDeadline.timeRemaining() >= 3) {
            task = taskQueue.pop();
            if (task) {
                task.callback();
                scheduleTask();
            } else {
                taskScheduling = false;
            }
        } else {
            taskScheduling = false;
            requestAnimationFrame(messageCycleCallback);
        }
    });
}

function messageCycleCallback() {
    // 有剩余任务
    if (taskQueue.length > 0) {
        !taskScheduling && scheduleTask();
    } else {
        messageCycleEnable = false;
    }

    // 循环开启再进入下个循环
    if (messageCycleEnable) {
        requestAnimationFrame(messageCycleCallback);
    }
}

function schedulePriorityCallback(priorityLevel, callback, { delay } = {}) {
    const currentTime = getCurrentTime();
    let startTime = currentTime;

    // 如果延迟执行
    if (delay) {
        startTime += delay;
    }

    const timeout = timeoutForTaskPriorityLevel(priorityLevel);
    const expirationTime = startTime + timeout;

    const task = {
        expirationTime,
        callback,
        taskId: taskId++
    };

    // 如果消息循环尚未开启，设置开启
    if (!messageCycleEnable) {
        messageCycleEnable = true;
    }
    // 加入任务队列
    taskQueue.push(task);
    // 如果没有开始任务调度，开始任务调度
    if (!taskScheduling) {
        scheduleTask();
    }
}

export {
    schedulePriorityCallback
}