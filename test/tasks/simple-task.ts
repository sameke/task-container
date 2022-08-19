import { Task } from '../../src/Task';

export const run: Task<string, boolean> = async (msg: string) => {
    console.log(msg);
    return true;
};

// export async function run(msg: string): Promise<boolean> {
//     console.log(msg);
//     return true;
// }

// export default async (msg: string) => {
//     console.log(msg);
//     return true;
// };