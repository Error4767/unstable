function createError(factoryName, excuse) {
    return new Error("parseq." + factoryName + (excuse ? (" excuse: " + excuse) : ""));
}

function checkCallback(callback, factoryName) {
    if (typeof callback !== "function" || callback.length !== 2) {
        throw createError(factoryName, "callback is a not function");
    }
}

function checkRequestorArray(requestorArray, factoryName) {
    if (
        !Array.isArray(requestorArray)
        || requestorArray.length < 1
        || requestorArray.some(requestor => (
            typeof requestor !== "function"
            || requestor.length < 1
            || requestor.length > 2
        ))
    ) {
        throw createError(factoryName, "requestors format wrong");
    }
}

// 运行函数
function run(
    functionName,
    requestorArray,
    initialValue,
    callback,
    timeout,
    timeLimit,
    concurrent = Number.MAX_SAFE_INTEGER,
) {
    // 存放所有取消函数
    let cancellers = [];
    // 取消所有
    const cancel = () => {
        cancellers && cancellers.forEach(c => ((typeof c === "function") && c(createError(functionName, "Cancel"))));
        cancellers = undefined;
    };
    // 当前请求器索引
    let currentRequestorIndex = 0;
    // 启动请求器的函数
    const startRequestor = (value) => {
        // 没有取消函数数组,则已经被取消
        if (!cancellers) {
            return;
        }
        // 调用完的话则不再调用
        if (currentRequestorIndex >= requestorArray.length) {
            return;
        }

        const requestor = requestorArray[currentRequestorIndex];
        // 当前请求器索引
        const thisRequestorIndex = currentRequestorIndex;

        currentRequestorIndex += 1;

        try {
            // 运行，获得取消函数
            cancellers[thisRequestorIndex] = requestor((value, reason) => {
                // 置空取消函数
                cancellers[thisRequestorIndex] = undefined;
                // 回调给外面函数
                callback(value, reason, thisRequestorIndex);
                // 调用下一个请求器,如果并发数为1，就传入上次请求器的结果,(串行执行)
                setTimeout(() => (concurrent === 1 ? startRequestor(value) : startRequestor(initialValue)), 0);
            }, value);
        } catch (err) {
            callback(undefined, err, thisRequestorIndex);
            // ? 使用什么作为value
            setTimeout(() => startRequestor(value), 0);
        }
    }
    // 超时动作
    if (timeLimit !== undefined) {
        // 如果有的话, 时间限制必须为大于0的数
        if (typeof timeLimit === "number" && timeLimit >= 0) {
            setTimeout(timeout, timeLimit);
        } else {
            throw createError(functionName, "invalid timeLimit");
        }
    }

    // 并发数必须为大于0的整数, 如果不是返回错误
    if (typeof concurrent !== "number" || concurrent <= 0 || !Number.isInteger(concurrent)) {
        throw createError(functionName, "invalid concurrent size");
    }
    // 运行数量
    let runNumber = Math.min(concurrent, requestorArray.length);
    while (runNumber > 0) {
        setTimeout(startRequestor, 0, initialValue);
        runNumber -= 1;
    }
    return cancel;
}

// 并行运行请求器
function parallel(
    requestorArray,
    timeLimit,
    concurrent,
    functionName = "parallel",
) {
    checkRequestorArray(requestorArray);
    return function parallelRequestor(callback, initialValue) {
        checkCallback(callback, functionName);
        // 剩余待运行的请求器数量
        let restRequestorNumber = requestorArray.length;
        const results = [];
        const cancel = run(
            functionName,
            requestorArray,
            initialValue,
            function parallelAction(value, reason, index) {
                restRequestorNumber -= 1;
                results[index] = value;
                // 有一个失败,就返回失败
                if (reason) {
                    cancel();
                    callback && callback(undefined, reason);
                    callback = undefined;
                }
                // 所有都成功就返回所有的
                if (restRequestorNumber < 1) {
                    callback && callback(results);
                    callback = undefined;
                }
            },
            function parallelTimeout() {
                cancel();
                callback && callback(undefined, createError(functionName, "timeout"));
                callback = undefined;
            },
            timeLimit,
            concurrent,
        );
        return cancel;
    }
}

// 有一个成功或失败,就返回这个成功或失败的
function race(
    requestorArray,
    timeLimit,
    concurrent,
    functionName = "race",
) {
    checkRequestorArray(requestorArray);
    return function raceRequestor(callback, initialValue) {
        checkCallback(callback, functionName);

        const cancel = run(
            functionName,
            requestorArray,
            initialValue,
            function raceAction(value, reason) {
                if (value) {
                    // 取消其他的
                    cancel();
                    callback && callback(value);
                    callback = undefined;
                } else if (reason) {
                    // 取消其他的
                    cancel();
                    callback && callback(undefined, value);
                    callback = undefined;
                }
            },
            function raceTimeout() {
                cancel();
                callback && callback(undefined, createError(functionName, "timeout"));
                callback = undefined;
            },
            timeLimit,
            concurrent,
        );
        return cancel;
    }
}

// 有一个成功,就返回这个成功,如果所有的都失败，返回一个AggregateError
function any(
    requestorArray,
    timeLimit,
    concurrent,
    functionName = "any",
) {
    checkRequestorArray(requestorArray);
    return function raceRequestor(callback, initialValue) {
        checkCallback(callback, functionName);
        // 剩余待运行的请求器数量
        let restRequestorNumber = requestorArray.length;
        const errors = [];
        const cancel = run(
            functionName,
            requestorArray,
            initialValue,
            function raceAction(value, reason, index) {
                restRequestorNumber -= 1;
                if (value) {
                    // 取消其他的
                    cancel();
                    callback && callback(value);
                    callback = undefined;
                }
                errors[index] = reason;
                // 所有都失败就返回一个AggregateError
                if (restRequestorNumber < 1) {
                    callback && callback(undefined, new AggregateError(errors));
                    callback = undefined;
                }
            },
            function raceTimeout() {
                cancel();
                callback && callback(undefined, createError(functionName, "timeout"));
                callback = undefined;
            },
            timeLimit,
            concurrent,
        );
        return cancel;
    }
}

// 如果超时，则返回一个失败，除此以外，不论成功或失败，都视为成功并且返回一个数组，包含所有结果，
function allSettled(
    requestorArray,
    timeLimit,
    concurrent,
    functionName = "allSettled",
) {
    checkRequestorArray(requestorArray);
    return function raceRequestor(callback, initialValue) {
        checkCallback(callback, functionName);
        // 剩余待运行的请求器数量
        let restRequestorNumber = requestorArray.length;
        const results = [];
        const cancel = run(
            functionName,
            requestorArray,
            initialValue,
            function raceAction(value, reason, index) {
                restRequestorNumber -= 1;
                results.push(value || reason);
                // 所有都完成之后，返回所有的
                if (restRequestorNumber < 1) {
                    callback && callback(results);
                    callback = undefined;
                }
            },
            function raceTimeout() {
                cancel();
                callback && callback(undefined, createError(functionName, "timeout"));
                callback = undefined;
            },
            timeLimit,
            concurrent,
        );
        return cancel;
    }
}

// 序列请求器(串行执行)
function sequence(
    requestorArray,
    timeLimit,
    functionName = "squence",
) {
    return parallel(requestorArray, timeLimit, 1, functionName);
}

export default ({
    parallel,
    race,
    any,
    allSettled,
    sequence,
});