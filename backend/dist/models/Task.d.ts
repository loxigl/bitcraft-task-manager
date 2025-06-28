import mongoose, { Document } from 'mongoose';
import { Task } from '../types';
export interface TaskDocument extends Omit<Task, 'id'>, Document {
    id: number;
}
export declare const TaskModel: mongoose.Model<TaskDocument, {}, {}, {}, mongoose.Document<unknown, {}, TaskDocument, {}> & TaskDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Task.d.ts.map