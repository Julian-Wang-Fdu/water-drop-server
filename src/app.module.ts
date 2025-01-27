import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { OSSModule } from './modules/oss/oss.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { CourseModule } from './modules/course/course.module';
import { CardModule } from './modules/card/card.module';
import { ProductModule } from './modules/product/product.module';
import { CardRecordModule } from './modules/cardRecord/card-record.module';
import { ScheduleRecordModule } from './modules/schedule-record/schedule-record.module';
import { StudentModule } from './modules/student/student.module';
import { ScheduleModule } from './modules/schedule/schedule.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'water-drop',
      entities: ['${__dirname}/../modules/**/*.entity{.ts,.js}'],
      logging: true,
      synchronize: false,
      autoLoadEntities: true
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: './schema.gql',
    }),
    UserModule,
    OSSModule,
    AuthModule,
    OrganizationModule,
    CourseModule,
    CardModule,
    ProductModule,
    CardRecordModule,
    ScheduleRecordModule,
    ScheduleModule,
    StudentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
