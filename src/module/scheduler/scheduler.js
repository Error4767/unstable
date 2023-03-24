import { Heap } from "../dataStructure/Heap.js";
import { Queue } from "../dataStructure/Queue.js";

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

// 使用自定义的 requestIdleCallback
const requestIdleCallback = (() => {
    let frameDeadline = 0; // 帧结束时间
    const messageChannel = new MessageChannel();
    let _callbackQueue = new Queue();

    let { port1, port2 } = messageChannel;

    function timeRemaining() {
        return frameDeadline - getCurrentTime();
    }

    port1.onmessage = function () {
        // 检测是否有剩余时间
        if (timeRemaining() > 0) {
            // 有剩余时间，调用回调
            _callbackQueue.size() > 0 && _callbackQueue.dequeue()({
                timeRemaining,
            });
        } else {
            if (document.visibilityState === "visible") {
                // 没有剩余时间,等待空闲时调用
                requestIdleCallback();
            } else {
                // 页面在后台，不需要绘制，直接调用回调
                _callbackQueue.size() > 0 && _callbackQueue.dequeue()({
                    timeRemaining,
                });
            }
        }
    }

    return function requestIdleCallback(callback) {
        // 添加到队列中,如果有 callback 的话
        callback && _callbackQueue.enqueue(callback);
        // 时间不足了，下一帧执行
        if (timeRemaining() <= 0) {
            if (document.visibilityState === "visible") {
                requestAnimationFrame(() => {
                    // 如果没有剩余时间，就重置为 16ms, 因为上一帧结束了
                    if (timeRemaining() <= 0) {// 避免一帧中重复设置
                        frameDeadline = getCurrentTime() + 16; // 加上 16ms,60fps 才够流畅
                    }
                    requestIdleCallback();
                });
            } else {
                // 页面在后台，不需要绘制，通知消息通道执行
                port2.postMessage("");
            }
        } else {
            // 时间足够，直接通知消息通道执行
            port2.postMessage("");
        }
    }
})();

// 优先级队列（小顶堆）
// 比较函数
function compareFunction(item1, item2) {
    const item1Time = item1.expirationTime;
    const item2Time = item2.expirationTime
    // 有时精度不高，只能精确到毫秒，此时判断任务id决定先后,id 小的为先（先添加的任务）
    if (item1Time === item2Time) {
        return item1.taskId < item2.taskId;
    }
    return item1Time <= item2Time;
}
// 用比较函数初始化堆
const taskQueue = new Heap(compareFunction);

// 任务调度进行中
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
        if (idleDeadline.timeRemaining() > 0) {
            task = taskQueue.pop();
            if (task) {
                task.callback();
                scheduleTask();
            } else {
                taskScheduling = false;
            }
        } else {
            taskScheduling = false;
            // 下一帧再开始调度
            requestIdleCallback(scheduleTask);
        }
    });
}

function scheduleExpireCallback(expirationTime, callback) {
    if(typeof expirationTime !== "number") {
        throw new TypeError("expiration time is a not number");
    }

    const task = {
        expirationTime,
        callback,
        taskId: taskId++
    };

    // 加入任务队列
    taskQueue.push(task);
    // 如果没有开始任务调度，开始任务调度
    if (!taskScheduling) {
        scheduleTask();
    }
}

function schedulePriorityCallback(priorityLevel, callback) {
    const currentTime = getCurrentTime();
    let startTime = currentTime;

    const timeout = timeoutForTaskPriorityLevel(priorityLevel);
    const expirationTime = startTime + timeout;
    scheduleExpireCallback(expirationTime, callback);
}

export {
    immediatePriority,
    userBlockingPriority,
    normalPriority,
    lowPriority,
    idlePriority,
    scheduleExpireCallback,
    schedulePriorityCallback
}