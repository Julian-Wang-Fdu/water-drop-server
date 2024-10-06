import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   // 全局启用 CORS
  app.enableCors({
    origin: 'http://localhost:5173',  // 允许的前端域名
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  // 允许的方法
    credentials: true,  // 是否允许发送凭证（如 Cookies）
  });
  await app.listen(3000);
}
bootstrap();
