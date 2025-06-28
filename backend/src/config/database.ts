import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bitcraft_task_manager';
    
    await mongoose.connect(mongoURI, {
      bufferCommands: false,
    });

    console.log('MongoDB подключена успешно');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Отключение от MongoDB...');
      await mongoose.connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB; 