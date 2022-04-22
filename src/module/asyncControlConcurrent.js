// 异步并发控制

// concurrent: number // 并发数
// actions: Array<()=> new Promise> // 实际异步操作
// failedBreak: boolean // 是否在失败后结束（不再运行剩余任务）
export function asyncControlConcurrent({ concurrent = 5, actions, failedBreak = false }) {
    // 浅复制一份,并且反转，便于之后pop的时候从后面取，性能更高
    let restActions = [...actions].reverse();
    // 当前运行的任务游标(标记第几个)
    let cursor = 0;
    // 返回值组
    const results = [];
    // 总任务数量
    const totalActionsNumber = restActions.length - 1;
    // 成功的任务数量
    let successActionsNumber = 0;
    return new Promise((resolve, reject)=> {
        let currentConcurrent = 0;
        // 并发调度
        (function executeConcurrentSchedule() {
            // 低于数量就增加，否则不做动作
            while(currentConcurrent < concurrent) {
                const asyncFn = restActions.pop();
                // 还有任务就做动作，没有的话不做动作，在最后一个任务结束后会自动resolve
                if(asyncFn) {
                    // 任务的序号，用于确保返回值顺序和传入的动作数组顺序相同，相对应
                    const index = cursor;
                    cursor += 1;
                    currentConcurrent += 1;
                    asyncFn().then(result=> {
                        // 添加到返回结果中
                        results[index] = result;
                        // 增加成功数
                        successActionsNumber += 1;
                        // 如果全部成功了，返回所有成功结果
                        if(successActionsNumber >= totalActionsNumber) {
                            resolve(results);
                        }
                        // 减少并发数
                        currentConcurrent -= 1;
                        // 继续执行并发调度
                        executeConcurrentSchedule();
                    }).catch((err)=> {
                        // 失败就直接 reject
                        reject(err);
                        // 减少并发数
                        currentConcurrent -= 1;
                        // 如果需要，清空剩余未执行的任务
                        failedBreak && (restActions = []);
                    }); 
                } else {
                    // 没有更多任务了，结束循环
                    break;
                }
            }
        })();
    })
}