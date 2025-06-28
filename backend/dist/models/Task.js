"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
const resourceSchema = new mongoose_1.Schema({
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
const subtaskSchema = new mongoose_1.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },
    assignedTo: [{ type: String }],
    professions: [{
            type: String,
            enum: Object.values(types_1.ProfessionType),
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
    subtasks: [{ type: mongoose_1.Schema.Types.Mixed }]
}, { _id: false });
subtaskSchema.add({ subtasks: [subtaskSchema] });
const taskSchema = new mongoose_1.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    professions: [{
            type: String,
            enum: Object.values(types_1.ProfessionType),
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
        enum: Object.values(types_1.TaskStatus),
        default: types_1.TaskStatus.OPEN
    },
    priority: {
        type: String,
        enum: Object.values(types_1.Priority),
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
        transform: function (doc, ret) {
            ret.levels = Object.fromEntries(ret.levels);
            ret.resources = ret.resources.map((resource) => ({
                ...resource,
                contributors: Object.fromEntries(resource.contributors)
            }));
            const transformSubtasks = (subtasks) => {
                return subtasks.map(subtask => ({
                    ...subtask,
                    levels: Object.fromEntries(subtask.levels),
                    resources: subtask.resources.map((resource) => ({
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
taskSchema.index({ id: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ professions: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.pre('save', async function (next) {
    if (this.isNew && !this.id) {
        const lastTask = await exports.TaskModel.findOne().sort({ id: -1 });
        this.id = lastTask ? lastTask.id + 1 : 1;
    }
    next();
});
exports.TaskModel = mongoose_1.default.model('Task', taskSchema);
//# sourceMappingURL=Task.js.map