import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { RegisterRequest, LoginRequest, AuthResponse, ProfessionType } from '../types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'bitcraft_secret_key';
const JWT_EXPIRE: string = process.env.JWT_EXPIRE || '7d';

export class AuthController {
  // Регистрация нового пользователя
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, guild }: RegisterRequest = req.body;
      
      // Проверяем существует ли пользователь
      const existingUser = await UserModel.findOne({
        $or: [{ email }, { name }]
      });
      
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email or name already exists'
        });
        return;
      }
      
      // Создаем нового пользователя с базовыми профессиями
      const defaultProfessions = new Map();
      Object.values(ProfessionType).forEach(profession => {
        defaultProfessions.set(profession, { level: 0 });
      });
      
      const newUser = new UserModel({
        name,
        email,
        password,
        guild,
        professions: defaultProfessions,
        level: 1,
        completedTasks: 0,
        currentTasks: 0,
        reputation: 0
      });
      
      await newUser.save();
      
      // Создаем JWT токен
      const payload = { userId: String(newUser._id), email: newUser.email };
      const token = (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
      
      const response: AuthResponse = {
        user: newUser.toJSON() as any,
        token
      };
      
      res.status(201).json({
        success: true,
        data: response,
        message: 'User successfully registered'
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  }
  
  // Вход в систему
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;
      
      // Находим пользователя по email
      const user = await UserModel.findOne({ email });
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }
      
      // Проверяем пароль
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }
      
      // Создаем JWT токен
      const payload = { userId: String(user._id), email: user.email };
      const token = (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
      
      const response: AuthResponse = {
        user: user.toJSON() as any,
        token
      };
      
      res.json({
        success: true,
        data: response,
        message: 'Successful login'
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  }
  
  // Получение текущего пользователя (для проверки токена)
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token not provided'
        });
        return;
      }
      
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
          res.status(401).json({
            success: false,
            message: 'User not found'
          });
          return;
        }
        
        res.json({
          success: true,
          data: user.toJSON(),
          message: 'User found'
        });
        
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
        return;
      }
      
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
} 