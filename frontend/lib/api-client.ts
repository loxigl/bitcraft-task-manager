interface Task {
  _id: string; // MongoDB ObjectId
  id?: number; // Опциональный числовой ID для совместимости
  name: string;
  professions: string[];
  levels: Record<string, number>;
  deadline: string;
  status: string;
  priority: string;
  description: string;
  resources: Array<{
    name: string;
    needed: number;
    gathered: number;
    unit: string;
    contributors: Record<string, number>;
  }>;
  assignedTo: string[];
  createdBy: string;
  shipTo: string;
  takeFrom: string;
  subtasks?: Task[];
  taskType?: 'guild' | 'member';
}

interface User {
  _id: string; // MongoDB ObjectId
  id?: string; // Опциональный string ID для совместимости
  name: string;
  email: string;
  avatar?: string;
  level: number;
  guild: string;
  role: 'member' | 'admin' | 'guild_leader';
  professions: Record<string, { level: number }>;
  completedTasks: number;
  currentTasks: number;
  reputation: number;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  guild: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // В dev режиме используем nginx proxy, в production тоже через nginx
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      const data = await response.json();
      
      if (!response.ok) {
        // Если есть errors массив - это ошибки валидации
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg).join(', ');
          return { 
            success: false, 
            data: null as T, 
            message: errorMessages 
          };
        }
        
        // Иначе показываем сообщение из ответа или общую ошибку
        return { 
          success: false, 
          data: null as T, 
          message: data.message || `HTTP error! status: ${response.status}` 
        };
      }
      
      // Проверяем, является ли ответ уже в формате ApiResponse
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return data as ApiResponse<T>;
      }
      
      // Если нет, оборачиваем в ApiResponse
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        data: null as T, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Task API methods
  async getAllTasks(): Promise<ApiResponse<Task[]>> {
    const response = await this.request<{tasks: Task[], pagination: any}>('/tasks');
    
    if (response.success && response.data) {
      // Проверяем что response.data.tasks существует и является массивом
      const tasks = response.data.tasks;
      if (Array.isArray(tasks)) {
        return {
          success: true,
          data: tasks
        };
      } else {
        console.warn('Tasks is not an array:', tasks);
        return { success: false, data: [], message: 'Invalid tasks data structure' };
      }
    }
    return { success: false, data: [], message: response.message };
  }

  async getTasksByType(taskType: 'guild' | 'member'): Promise<ApiResponse<Task[]>> {
    const response = await this.request<{tasks: Task[], pagination: any}>(`/tasks?taskType=${taskType}`);
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.tasks
      };
    }
    return { success: false, data: [], message: response.message };
  }

  async getTaskById(taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}`);
  }

  async createTask(taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async claimTask(taskId: string, userName: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ userName }),
    });
  }

  async claimSubtask(taskId: string, subtaskId: string, userName: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}/subtasks/${subtaskId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ userName }),
    });
  }

  async completeSubtask(taskId: string, subtaskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}/subtasks/${subtaskId}/complete`, {
      method: 'PUT',
    });
  }

  async completeTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}/complete`, {
      method: 'PUT',
    });
  }

  async updateResourceContribution(
    taskId: string,
    resourceName: string,
    quantity: number,
    userName: string,
    subtaskId?: string
  ): Promise<ApiResponse<Task>> {
    const body: any = { quantity, userName };
    if (subtaskId) {
      body.subtaskId = subtaskId;
    }
    
    return this.request<Task>(`/tasks/${taskId}/resources/${resourceName}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // User API methods
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  async getUserByName(userName: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/name/${userName}`);
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateProfessionLevel(
    userId: string,
    profession: string,
    level: number
  ): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}/professions/${profession}`, {
      method: 'PUT',
      body: JSON.stringify({ level }),
    });
  }

  async updateProfile(userId: string, profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateGuild(userId: string, guild: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}/guild`, {
      method: 'PUT',
      body: JSON.stringify({ guild }),
    });
  }

  async getUserStats(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${userId}/stats`);
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Auth API methods
  async register(registerData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  }

  async login(loginData: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient();
export type { Task, User, ApiResponse, RegisterRequest, LoginRequest, AuthResponse }; 