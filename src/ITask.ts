export interface ITask<T, TResult> {
    run: (data: T) => Promise<TResult>;
}