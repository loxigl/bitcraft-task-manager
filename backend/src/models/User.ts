import mongoose, { Document, Schema } from 'mongoose';
import { User, ProfessionType } from '../types';

export interface UserDocument extends User, Document {}

const professionSchema = new Schema({
  level: { type: Number, required: true, min: 0, max: 100, default: 0 }
}, { _id: false });

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatar: { type: String, default: '/placeholder.svg' },
  level: { type: Number, required: true, min: 1, default: 1 },
  guild: { type: String, required: true, trim: true },
  professions: {
    type: Map,
    of: professionSchema,
    default: () => {
      const defaultProfessions = new Map();
      Object.values(ProfessionType).forEach(profession => {
        defaultProfessions.set(profession, { level: 0 });
      });
      return defaultProfessions;
    }
  },
  completedTasks: { type: Number, default: 0, min: 0 },
  currentTasks: { type: Number, default: 0, min: 0 },
  reputation: { type: Number, default: 0, min: 0 }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.professions = Object.fromEntries(ret.professions);
      return ret;
    }
  }
});

// Indexes
userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
userSchema.index({ guild: 1 });
userSchema.index({ level: -1 });
userSchema.index({ reputation: -1 });

// Pre-save middleware to ensure all professions exist
userSchema.pre('save', function(next) {
  if (this.professions) {
    Object.values(ProfessionType).forEach(profession => {
      if (!this.professions.has(profession)) {
        this.professions.set(profession, { level: 0 });
      }
    });
  }
  next();
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema); 