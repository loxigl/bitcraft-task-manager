import mongoose, { Document, Schema } from 'mongoose';
import { Template, TaskType } from '../types';

export interface TemplateDocument extends Omit<Template, 'id'>, Document {
  id: string;
}

const resourceSchema = new Schema({
  name: { type: String, required: true },
  needed: { type: Number, required: true, min: 0 },
  unit: { type: String, required: false },
}, { _id: false });

const subtaskSchema = new Schema({
  id: { type: Schema.Types.Mixed, required: true }, // Support both String and Number IDs
  name: { type: String, required: true },
  professions: [{
    type: String,
    enum: ['carpentry', 'farming', 'fishing', 'foraging', 'forestry', 'hunting', 'leatherworking', 'masonry', 'mining', 'scholar', 'smithing', 'tailoring'],
    required: true
  }],
  levels: {
    type: Map,
    of: Number,
    required: true
  },
  dependencies: [{ type: Schema.Types.Mixed }], // Support both String and Number IDs
  subtaskOf: { type: Schema.Types.Mixed, default: null }, // Support both String and Number IDs
  description: { type: String, required: false },
  shipTo: { type: String, default: null },
  takeFrom: { type: String, default: null },
  resources: [resourceSchema],
  subtasks: [{ type: Schema.Types.Mixed }] // Self-referencing for nested subtasks
}, { _id: false });

// Set recursive reference for subtasks
subtaskSchema.add({ subtasks: [subtaskSchema] });

const templateSchema = new Schema<TemplateDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  originalTaskId: { type: Number, required: false },
  professions: [{
    type: String,
    enum: ['carpentry', 'farming', 'fishing', 'foraging', 'forestry', 'hunting', 'leatherworking', 'masonry', 'mining', 'scholar', 'smithing', 'tailoring'],
    required: true
  }],
  levels: {
    type: Map,
    of: { type: Number, min: 0, max: 100 },
    default: () => new Map()
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  description: { type: String, required: false },
  resources: [resourceSchema],
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
      
      // Обрабатываем subtasks рекурсивно
      ret.subtasks = transformSubtasks(ret.subtasks || []);
      
      return ret;
    }
  }
});

// Indexes
templateSchema.index({ id: 1 });
templateSchema.index({ name: 1 });
templateSchema.index({ createdBy: 1 });
templateSchema.index({ createdAt: -1 });

export const TemplateModel = mongoose.model<TemplateDocument>('Template', templateSchema); 