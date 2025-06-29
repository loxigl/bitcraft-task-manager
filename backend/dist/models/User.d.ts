import mongoose, { Document } from 'mongoose';
import { User } from '../types';
export interface UserDocument extends User, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const UserModel: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument, {}> & UserDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map