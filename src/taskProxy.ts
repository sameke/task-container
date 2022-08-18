import { IRunnerError } from './IRunnerError';
import { ITask } from './ITask';
import { ITaskOptions } from './ITaskOptions';

const runTask = async (options: ITaskOptions) => {
    try {
        console.log('attempting to run task');
        let task: ITask<any, any> = import(options.script) as any as ITask<any, any>;
        if (task != null) {
            let result = await task.run(options.data);
            process.send({ result: result });
        }
    } catch (ex) {
        console.log('failed here');
        process.send({ error: (ex as any).message ?? 'an error has occurred in task' });
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
    process.send({ error: ex.message } as IRunnerError);
});

process.on('unhandledRejection', () => {
    process.send({ error: 'unhandled rejection error' } as IRunnerError);
});