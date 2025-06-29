import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, ProfessionType, UserRole } from '../types';

export interface UserDocument extends User, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const professionSchema = new Schema({
  level: { type: Number, required: true, min: 0, max: 100, default: 0 }
}, { _id: false });

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '/placeholder.svg' },
  level: { type: Number, required: true, min: 1, default: 1 },
  guild: { type: String, required: true, trim: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.MEMBER },
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
      // Безопасное преобразование Map в Object
      if (ret.professions && ret.professions instanceof Map) {
        ret.professions = Object.fromEntries(ret.professions);
      } else if (ret.professions && typeof ret.professions === 'object') {
        // Если это уже объект, оставляем как есть
        ret.professions = ret.professions;
      } else {
        ret.professions = {};
      }
      // Исключаем пароль из JSON ответа
      delete ret.password;
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

// Pre-save middleware to hash password and ensure all professions exist
userSchema.pre('save', async function(next) {
  // Hash password if it's modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Ensure all professions exist
  if (this.professions) {
    Object.values(ProfessionType).forEach(profession => {
      if (!this.professions.has(profession)) {
        this.professions.set(profession, { level: 0 });
      }
    });
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<UserDocument>('User', userSchema); 