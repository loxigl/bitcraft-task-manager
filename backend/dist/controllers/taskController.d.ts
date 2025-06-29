import { Request, Response } from 'express';
export declare class TaskController {
    static getAllTasks(req: Request, res: Response): Promise<void>;
    static getTaskById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createTask(req: Request, res: Response): Promise<void>;
    static updateTask(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static claimTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static claimSubtask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static completeSubtask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateResourceContribution(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static completeTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=taskController.d.ts.map