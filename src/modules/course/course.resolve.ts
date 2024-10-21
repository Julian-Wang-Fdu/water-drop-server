import { GqlAuthGuard } from "@/guards/auth.guard";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CourseService } from "./course.service";
import { CourseType } from "./dto/course.type";
import { COURSE_CREATE_FAIL, COURSE_DEL_FAIL, COURSE_NOT_EXIST, COURSE_UPDATE_FAIL, SUCCESS } from "@/common/constants/code";
import { CourseResult, CourseResults } from "./dto/result-course.output";
import { PageInput } from "@/common/dto/page.input";
import { CurUserId } from "@/decorators/current-user.decorator";
import { DeepPartial, FindOptionsWhere, Like } from "typeorm";
import { Course } from "./module/course.entity";
import { Result } from "@/common/dto/result.type";
import { CourseInput } from "./dto/course.input";

@Resolver(() => CourseType)
@UseGuards(GqlAuthGuard)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query(() => CourseResult)
  async getCourseInfo(@Args('id') id: string): Promise<CourseResult> {
    const result = await this.courseService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: '获取成功',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '课程信息不存在',
    };
  }

  @Mutation(() => CourseResult)
  async commitCourseInfo(
    @Args('params') params: CourseInput,
    @CurUserId() userId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<Result> {
    if (!id) {
      const res = await this.courseService.create({
        ...params,
        createdBy: userId,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '创建成功',
        };
      }
      return {
        code: COURSE_CREATE_FAIL,
        message: '创建失败',
      };
    }
    const course = await this.courseService.findById(id);
    if (course) {
      const courseInput: DeepPartial<Course> = {
        ...params,
        updatedBy: userId,
      };
      const res = await this.courseService.updateById(course.id, courseInput);
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
      return {
        code: COURSE_UPDATE_FAIL,
        message: '更新失败',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '课程信息不存在',
    };
  }

  @Query(() => CourseResults)
  async getCourses(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<CourseResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Course> = {createdBy: userId,}
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.courseService.findCourses({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    });
    return {
      code: SUCCESS,
      data: results,
      page: {
        pageNum,
        pageSize,
        total,
      },
      message: '获取成功',
    };
  }

  @Mutation(() => Result)
  async deleteCourse(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.courseService.findById(id);
    if (result) {
      const delRes = await this.courseService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: '删除成功',
        };
      }
      return {
        code: COURSE_DEL_FAIL,
        message: '删除失败',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: '门店信息不存在',
    };
  }

}