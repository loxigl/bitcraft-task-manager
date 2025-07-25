export enum ProfessionType {
  CARPENTRY = 'carpentry',
  FARMING = 'farming',
  FISHING = 'fishing',
  FORAGING = 'foraging',
  FORESTRY = 'forestry',
  HUNTING = 'hunting',
  LEATHERWORKING = 'leatherworking',
  MASONRY = 'masonry',
  MINING = 'mining',
  SCHOLAR = 'scholar',
  SMITHING = 'smithing',
  TAILORING = 'tailoring'
}

export enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  GUILD_LEADER = 'guild_leader'
}

export enum TaskType {
  GUILD = 'guild',
  MEMBER = 'member'
}

export enum TaskStatus {
  OPEN = 'open',
  TAKEN = 'taken',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ProfessionLevel {
  level: number;
}

export interface ResourceContribution {
  [contributor: string]: number;
}

export interface Resource {
  name: string;
  needed: number;
  gathered: number;
  unit: string;
  contributors: Map<string, number>;
}

export type TemplateResource = Omit<Resource, 'gathered' | 'contributors'>;

export interface Subtask {
  id: number | string;
  name: string;
  completed: boolean;
  assignedTo: string[];
  professions: ProfessionType[];
  levels: Map<ProfessionType, number>;
  dependencies: (number | string)[];
  subtaskOf: number | string | null;
  description: string;
  shipTo: string | null;
  takeFrom: string | null;
  resources: Resource[];
  subtasks?: Subtask[];
}

export interface TemplateSubtask {
  id: number | string;
  name: string;
  professions: ProfessionType[];
  levels: Map<ProfessionType, number>;
  dependencies: (number | string)[];
  subtaskOf: number | string | null;
  description: string;
  shipTo: string | null;
  takeFrom: string | null;
  resources: TemplateResource[];
  subtasks?: TemplateSubtask[];
}

export interface Task {
  id: number;
  name: string;
  professions: ProfessionType[];
  levels: Map<ProfessionType, number>;
  deadline: string;
  status: TaskStatus;
  priority: Priority;
  description: string;
  resources: Resource[];
  assignedTo: string[];
  createdBy: string;
  shipTo: string;
  takeFrom: string;
  taskType: TaskType;
  subtasks: Subtask[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Template {
  id: string;
  name: string;
  originalTaskId?: number | null;
  professions: ProfessionType[];
  levels: Map<ProfessionType, number>;
  priority: Priority;
  description: string;
  resources: TemplateResource[];
  createdBy: string;
  shipTo: string;
  takeFrom: string;
  taskType: TaskType;
  subtasks: TemplateSubtask[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateRequest {
  name: string;
  taskId?: number;
  subtaskId?: string;
}

export interface User {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  level: number;
  guild: string;
  role: UserRole;
  professions: Map<ProfessionType, ProfessionLevel>;
  completedTasks: number;
  currentTasks: number;
  reputation: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  guild: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface AuthRequest {
  user?: User;
}

export interface CreateTaskRequest {
  name: string;
  professions: ProfessionType[];
  levels: Map<ProfessionType, number>;
  deadline: string;
  priority: Priority;
  description: string;
  resources: Omit<Resource, 'contributors' | 'gathered'>[];
  shipTo: string;
  takeFrom: string;
  taskType: TaskType;
  subtasks?: Omit<Subtask, 'id'>[];
}

export interface UpdateResourceRequest {
  quantity: number;
}

export interface ClaimTaskRequest {
  userId: string;
} 