import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "./module/course.entity";
import { CourseService } from "./course.service";
import { CourseResolver } from "./course.resolve";

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  providers: [CourseService, CourseResolver],
  exports: [CourseService],
})
export class CourseModule {}