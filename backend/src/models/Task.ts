import mongoose, { Document, Schema } from 'mongoose';
import { Task, TaskStatus, Priority, ProfessionType, TaskType } from '../types';

export interface TaskDocument extends Omit<Task, 'id'>, Document {
  id: number;
}

const resourceSchema = new Schema({
  name: { type: String, required: true },
  needed: { type: Number, required: true, min: 0 },
  gathered: { type: Number, default: 0, min: 0 },
  unit: { type: String, required: false },
  contributors: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, { _id: false });

const subtaskSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  assignedTo: [{ type: String }],
  professions: [{
    type: String,
    enum: Object.values(ProfessionType),
    required: true
  }],
  levels: {
    type: Map,
    of: Number,
    required: true
  },
  dependencies: [{ type: Number }],
  description: { type: String, required: false },
  shipTo: { type: String, default: null },
  takeFrom: { type: String, default: null },
  resources: [resourceSchema],
  subtasks: [{ type: Schema.Types.Mixed }] // Self-referencing for nested subtasks
}, { _id: false });

// Set recursive reference for subtasks
subtaskSchema.add({ subtasks: [subtaskSchema] });

const taskSchema = new Schema<TaskDocument>({
  id: { type: Number, unique: true },
  name: { type: String, required: true, trim: true },
  professions: [{
    type: String,
    enum: Object.values(ProfessionType),
    required: true
  }],
  levels: {
    type: Map,
    of: { type: Number, min: 0, max: 100 },
    default: () => new Map()
  },
  deadline: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.OPEN
  },
  priority: {
    type: String,
    enum: Object.values(Priority),
    required: true
  },
  description: { type: String, required: false },
  resources: [resourceSchema],
  assignedTo: [{ type: String }],
  createdBy: { type: String, required: true },
  shipTo: { type: String, required: false },
  takeFrom: { type: String, required: false },
  taskType: {
    type: String,
    enum: Object.values(TaskType),
    default: TaskType.MEMBER
  },
  subtasks: [subtaskSchema]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Функция для преобразования subtasks рекурсивно
      const transformSubtasks = (subtasks: any[]): any[] => {
        if (!Array.isArray(subtasks)) return [];
        return subtasks.map(subtask => ({
          ...subtask,
          levels: subtask.levels instanceof Map 
            ? Object.fromEntries(subtask.levels)
            : (subtask.levels || {}),
          resources: Array.isArray(subtask.resources) 
            ? subtask.resources.map((resource: any) => ({
                ...resource,
                contributors: resource.contributors instanceof Map
                  ? Object.fromEntries(resource.contributors)
                  : (resource.contributors || {})
              }))
            : [],
          subtasks: subtask.subtasks ? transformSubtasks(subtask.subtasks) : []
        }));
      };

      // Безопасное преобразование Map в Object для levels
      if (ret.levels && ret.levels instanceof Map) {
        ret.levels = Object.fromEntries(ret.levels);
      } else if (ret.levels && typeof ret.levels === 'object') {
        ret.levels = ret.levels;
      } else {
        ret.levels = {};
      }
      
      // Безопасное преобразование Map в Object для resources contributors
      if (ret.resources && Array.isArray(ret.resources)) {
        ret.resources = ret.resources.map((resource: any) => ({
          ...resource,
          contributors: resource.contributors instanceof Map 
            ? Object.fromEntries(resource.contributors)
            : resource.contributors || {}
        }));
      }
      
      // Обрабатываем subtasks рекурсивно
      ret.subtasks = transformSubtasks(ret.subtasks || []);
      
      return ret;
    }
  }
});

// Indexes
taskSchema.index({ id: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ professions: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ createdAt: -1 });

// Middleware to auto-increment task ID
taskSchema.pre('save', async function(next) {
  if (this.isNew && !this.id) {
    const lastTask = await TaskModel.findOne().sort({ id: -1 });
    this.id = lastTask ? lastTask.id + 1 : 1;
  }
  next();
});

export const TaskModel = mongoose.model<TaskDocument>('Task', taskSchema); 