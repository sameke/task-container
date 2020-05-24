import { IRunnerError } from './IRunnerError';
import { ITaskOptions } from './ITaskOptions';

const runScript = (options: ITaskOptions) => {
    try {
        let task = require(options.script);
        if (task != null) {
            if (task.length < 2) {
                // passed function returns a promise
                task(options.data).then((result: any) => {
                    process.send({ result: result });
                }).catch((err: Error) => {
                    process.send({ error: err.message ?? 'an error has occurred in task' });
                });
            } else {
                // passed function expects a callback
                task(options.data, (err: Error, result: any) => {
                    if (err != null) {
                        process.send({ error: err.message ?? 'an error has occurred in task' });
                    } else {
                        process.send({ result: result });
                    }
                });
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