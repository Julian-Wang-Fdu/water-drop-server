import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ScheduleRecordType } from "./dto/schedule-record.type";
import { UseGuards } from "@nestjs/common/decorators";
import { GqlAuthGuard } from "@/guards/auth.guard";
import { ScheduleRecordService } from "./schedule-record.service";
import { CardRecordService } from "../cardRecord/card-record.service";
import { ScheduleRecordResult, ScheduleRecordResults } from "./dto/result-schedule-record.output";
import { CANCEL_SCHEDULE_FAIL, COURSE_DEL_FAIL, COURSE_NOT_EXIST, SCHEDULE_RECORD_NOT_EXIST, SUCCESS } from "@/common/constants/code";
import { PageInput } from "@/common/dto/page.input";
import { CurUserId } from "@/decorators/current-user.decorator";
import { CardType, ScheduleStatus } from "@/common/constants/enmu";
import dayjs from "dayjs";
import { Result } from "@/common/dto/result.type";

@Resolver(() => ScheduleRecordType)
@UseGuards(GqlAuthGuard)
export class ScheduleRecordResolver {
  constructor(
    private readonly scheduleRecordService: ScheduleRecordService,
    private readonly cardRecordService: CardRecordService,
  ) {}

  @Query(() => ScheduleRecordResult)
  async getScheduleRecordInfo(
    @Args('id') id: string,
  ): Promise<ScheduleRecordResult> {
    const result = await this.scheduleRecordService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: 'Get schedule record success',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: 'Course not exist',
    };
  }

  @Query(() => ScheduleRecordResults, {
    description: 'Get schedule records for someone',
  })
  async getScheduleRecords(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
  ): Promise<ScheduleRecordResults> {
    // 第一步：获取我的课程表列表
    const { pageNum, pageSize } = page;
    const [scheduleRecords, total] =
      await this.scheduleRecordService.findScheduleRecords({
        start: (pageNum - 1) * pageSize,
        length: pageSize,
        where: {
          student: {
            id: userId,
          },
        },
      });

    const data: ScheduleRecordType[] = [];
    // 第二步：完善课程表状态
    for (const scheduleRecord of scheduleRecords) {
      let status = ScheduleStatus.NO_DO;
      const { schedule } = scheduleRecord;
      // 20230302 12:12:12
      const startTime = dayjs(
        `${dayjs(schedule.schoolDay).format('YYYYMMDD')} ${schedule.startTime}`,
        'YYYYMMDD HH:mm:ss',
      );
      // 已经开始
      if (dayjs().isAfter(startTime)) {
        status = ScheduleStatus.DOING;
      }
      const endTime = dayjs(
        `${dayjs(schedule.schoolDay).format('YYYYMMDD')} ${schedule.endTime}`,
        'YYYYMMDD HH:mm:ss',
      );

      // 已经结束了
      if (dayjs().isAfter(endTime)) {
        status = ScheduleStatus.FINISH;
      }

      if (!scheduleRecord.status) {
        data.push({
          ...scheduleRecord,
          status,
        });
      } else {
        data.push(scheduleRecord);
      }
    }
    return {
      code: SUCCESS,
      data,
      message: 'Get record success',
      page: {
        pageNum,
        pageSize,
        total,
      },
    };
  }

  @Mutation(() => Result)
  async deleteScheduleRecord(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.scheduleRecordService.findById(id);
    if (result) {
      const delRes = await this.scheduleRecordService.deleteById(id, userId);
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

  // 取消已经预约的课程
  @Mutation(() => Result, {
    description: 'Cancel reserved course',
  })
  async cancelSubscribeCourse(
    @Args('scheduleRecordId') scheduleRecordId: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    // 第一步：各种的校验
    const scheduleRecord = await this.scheduleRecordService.findById(
      scheduleRecordId,
    );

    if (!scheduleRecord) {
      return {
        code: SCHEDULE_RECORD_NOT_EXIST,
        message: 'Schedule record not exist',
      };
    }

    // 已经取消的状态
    if (scheduleRecord.status === ScheduleStatus.CANCEL) {
      return {
        code: CANCEL_SCHEDULE_FAIL,
        message: 'Cancel fail , please do not cancel twice',
      };
    }

    const { schedule } = scheduleRecord;

    const startTime = dayjs(
      `${dayjs(schedule.schoolDay).format('YYYYMMDD')} ${schedule.startTime}`,
      'YYYYMMDD HH:mm:ss',
    );

    // 课程已经开始，不能取消了
    if (dayjs().isAfter(startTime.subtract(15, 'm'))) {
      return {
        code: CANCEL_SCHEDULE_FAIL,
        message: 'Cannot cancel a started course',
      };
    }
    // 第二步，取消预约，更新状态
    const res = await this.scheduleRecordService.updateById(scheduleRecordId, {
      status: ScheduleStatus.CANCEL,
      updatedBy: userId,
    });

    if (!res) {
      return {
        code: CANCEL_SCHEDULE_FAIL,
        message: 'Cancel schedule fail',
      };
    }
    // 第三步，卡归还
    const cardRecord = await this.cardRecordService.findById(
      scheduleRecord.cardRecord.id,
    );
    if (cardRecord.card.type === CardType.TIME) {
      const r = await this.cardRecordService.updateById(cardRecord.id, {
        residueTime: cardRecord.residueTime + 1,
        updatedBy: userId,
      });
      if (!r) {
        return {
          code: CANCEL_SCHEDULE_FAIL,
          message: 'Cancel fail',
        };
      }
    }
    return {
      code: SUCCESS,
      message: 'Cancel success',
    };
  }
}