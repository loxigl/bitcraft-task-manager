import mongoose, { Document, Schema } from 'mongoose';
import { Task, TaskStatus, Priority, ProfessionType } from '../types';

export interface TaskDocument extends Omit<Task, 'id'>, Document {
  id: number;
}

const resourceSchema = new Schema({
  name: { type: String, required: true },
  needed: { type: Number, required: true, min: 0 },
  gathered: { type: Number, default: 0, min: 0 },
  unit: { type: String, required: true },
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
  description: { type: String, required: true },
  shipTo: { type: String, default: null },
  takeFrom: { type: String, default: null },
  resources: [resourceSchema],
  subtasks: [{ type: Schema.Types.Mixed }] // Self-referencing for nested subtasks
}, { _id: false });

// Set recursive reference for subtasks
subtaskSchema.add({ subtasks: [subtaskSchema] });

const taskSchema = new Schema<TaskDocument>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
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
  description: { type: String, required: true },
  resources: [resourceSchema],
  assignedTo: [{ type: String }],
  createdBy: { type: String, required: true },
  shipTo: { type: String, required: true },
  takeFrom: { type: String, required: true },
  subtasks: [subtaskSchema]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.levels = Object.fromEntries(ret.levels);
      ret.resources = ret.resources.map((resource: any) => ({
        ...resource,
        contributors: Object.fromEntries(resource.contributors)
      }));
      
      const transformSubtasks = (subtasks: any[]): any[] => {
        return subtasks.map(subtask => ({
          ...subtask,
          levels: Object.fromEntries(subtask.levels),
          resources: subtask.resources.map((resource: any) => ({
            ...resource,
            contributors: Object.fromEntries(resource.contributors)
          })),
          subtasks: subtask.subtasks ? transformSubtasks(subtask.subtasks) : []
        }));
      };
      
      ret.subtasks = transformSubtasks(ret.subtasks);
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