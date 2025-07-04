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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const types_1 = require("../types");
const professionSchema = new mongoose_1.Schema({
    level: { type: Number, required: true, min: 0, max: 100, default: 0 }
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '/placeholder.svg' },
    level: { type: Number, required: true, min: 1, default: 1 },
    guild: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(types_1.UserRole), default: types_1.UserRole.MEMBER },
    professions: {
        type: Map,
        of: professionSchema,
        default: () => {
            const defaultProfessions = new Map();
            Object.values(types_1.ProfessionType).forEach(profession => {
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
        transform: function (doc, ret) {
            if (ret.professions && ret.professions instanceof Map) {
                ret.professions = Object.fromEntries(ret.professions);
            }
            else if (ret.professions && typeof ret.professions === 'object') {
                ret.professions = ret.professions;
            }
            else {
                ret.professions = {};
            }
            delete ret.password;
            return ret;
        }
    }
});
userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
userSchema.index({ guild: 1 });
userSchema.index({ level: -1 });
userSchema.index({ reputation: -1 });
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
    }
    if (this.professions) {
        Object.values(types_1.ProfessionType).forEach(profession => {
            if (!this.professions.has(profession)) {
                this.professions.set(profession, { level: 0 });
            }
        });
    }
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
exports.UserModel = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map