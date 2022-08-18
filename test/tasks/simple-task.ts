import { ITask } from '../../src/ITask';

export const MyTask: ITask<string, boolean> = {
    run: async (msg: string) => {
        console.log(msg);
        return true;
    }
}