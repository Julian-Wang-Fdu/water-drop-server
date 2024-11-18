import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { StudentType } from "./dto/student.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/guards/auth.guard";
import { StudentService } from "./student.service";
import { StudentResult, StudentResults } from "./dto/result-student.output";
import { CurUserId } from "@/decorators/current-user.decorator";
import { STUDENT_NOT_EXIST, SUCCESS } from "@/common/constants/code";
import { StudentInput } from "./dto/student.input";
import { Result } from "@/common/dto/result.type";
import { PageInput } from "@/common/dto/page.input";

@Resolver(() => StudentType)
@UseGuards(GqlAuthGuard)
export class StudentResolver {
  constructor(private readonly studentService: StudentService) {}

  @Query(() => StudentResult)
  async getStudentInfo(@CurUserId() id: string): Promise<StudentResult> {
    const result = await this.studentService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: 'Get student info success',
      };
    }
    return {
      code: STUDENT_NOT_EXIST,
      message: 'Student not exist',
    };
  }

  @Mutation(() => StudentResult)
  async commitStudentInfo(
    @Args('params') params: StudentInput,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const student = await this.studentService.findById(userId);
    if (student) {
      const res = await this.studentService.updateById(student.id, params);
      if (res) {
        return {
          code: SUCCESS,
          message: 'Update success',
        };
      }
    }
    return {
      code: STUDENT_NOT_EXIST,
      message: 'Student not exist',
    };
  }

  @Query(() => StudentResults)
  async getStudents(@Args('page') page: PageInput): Promise<StudentResults> {
    const { pageNum, pageSize } = page;
    const [results, total] = await this.studentService.findStudents({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
    });
    return {
      code: SUCCESS,
      data: results,
      page: {
        pageNum,
        pageSize,
        total,
      },
      message: 'Get students success',
    };
  }
}
