import { IRunnerError } from './IRunnerError';
import { Task } from './Task';
import { ITaskOptions } from './ITaskOptions';

const runTask = async (options: ITaskOptions) => {
    try {
        let task: { run: Task<any, any> } | { default: Task<any, any> } = await import(options.script);
        if ((task as { default: Task<any, any> }).default != null) {
            (task as any).run = (task as any).default;
        }
        if (task != null) {
            let result = await (task as any).run(options.data);

            if (process?.send != null) {
                process.send({ result: result });
            } else {
                return result;
            }
        }
    } catch (ex) {
        if (process?.send != null) {
            process.send({ error: (ex as any).message ?? 'an error has occurred in task' });
        } else {
            console.log((ex as any).message ?? 'an error has occurred in task');
        }
    }
};

process.on('message', (msg: ITaskOptions) => {
    // ensure we have necessary params
    if (msg?.script == null || typeof msg.script !== 'string' || msg.script.trim() === '') {
        process.send({ error: 'no script specified' } as IRunnerError);
    } else {
        runTask(msg);
    }
});

process.on('uncaughtException', (ex: Error) => {
    if (process?.send != null) {
        process.send({ error: ex.message } as IRunnerError);
    } else {
        console.log(ex.message ?? 'uncaught exception');
    }
});

process.on('unhandledRejection', () => {
    if (process?.send != null) {
        process.send({ error: 'unhandled rejection error' } as IRunnerError);
    } else {
        console.log('unhandled rejection error');
    }
});

export default runTask;