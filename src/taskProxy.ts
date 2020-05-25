import { IRunnerError } from './IRunnerError';
import { ITaskOptions } from './ITaskOptions';

const runScript = (options: ITaskOptions) => {
    try {
        let task = require(options.script);
        if (task != null) {
            let runnable = task.default ?? task;
            if (runnable.length < 2) {
                // passed function returns a promise
                let p = runnable(options.data);
                if (p == null || (p instanceof Promise) !== true) {
                    process.send({ error: 'Invalid task signature. Task must return a promise or take a callback as the second parameter.' });
                } else {
                    p.then((result: any) => {
                        process.send({ result: result });
                    }).catch((err: Error) => {
                        process.send({ error: err.message ?? 'an error has occurred in task' });
                    });
                }
            } else if (runnable.length === 2) {
                // passed function expects a callback
                runnable(options.data, (err: Error, result: any) => {
                    if (err != null) {
                        process.send({ error: err.message ?? 'an error has occurred in task' });
                    } else {
                        process.send({ result: result });
                    }
                });
            } else {
                process.send({ error: 'Invalid task signature. A task must have either no argument or a single argument and return a promise, or take a data object and callback as the second parameter.' });
            }
        }
    } catch (ex) {
        process.send({ error: ex.message ?? 'an error has occurred in task' });
    }
};

process.on('message', (msg: ITaskOptions) => {
    // ensure we have necessary params
    if (msg.script == null || typeof msg.script !== 'string' || msg.script.trim() === '') {
        process.send({ error: 'no script specified' } as IRunnerError);
    } else {
        runScript(msg);
    }
});

process.on('uncaughtException', (ex: Error) => {
    process.send({ error: ex.message } as IRunnerError);
});

process.on('unhandledRejection', () => {
    process.send({ error: 'unhandled rejection error' } as IRunnerError);
});