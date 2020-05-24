export interface IInternalTask {
    path: string;
    data: any;
    cb: {
        resolve: (result: any) => void;
        reject: (error: any) => void;
        promise: Promise<any>;
    };
}