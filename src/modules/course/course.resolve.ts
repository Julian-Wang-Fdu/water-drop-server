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
import { PartialCourseInput } from "./dto/course.input";
import { CurOrgId } from "@/decorators/current-org.decorator";

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
        message: 'Get course success',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: 'Course not exist',
    };
  }

  @Mutation(() => CourseResult)
  async commitCourseInfo(
    @Args('params') params: PartialCourseInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId:string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<Result> {
    if (!id) {
      const res = await this.courseService.create({
        ...params,
        createdBy: userId,
        org:{
          id: orgId
        }
      });
      if (res) {
        return {
          code: SUCCESS,
          message: 'create success',
        };
      }
      return {
        code: COURSE_CREATE_FAIL,
        message: 'create fail',
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
          message: 'Update success',
        };
      }
      return {
        code: COURSE_UPDATE_FAIL,
        message: 'Update fail',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: 'Course not exist',
    };
  }

  @Query(() => CourseResults)
  async getCourses(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId:string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<CourseResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Course> = {
      createdBy: userId,
      org:{
        id: orgId
      }
    }
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
      message: 'Get course list success',
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
          message: 'Delete success',
        };
      }
      return {
        code: COURSE_DEL_FAIL,
        message: 'Delete fail',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: 'Store not exist',
    };
  }

}