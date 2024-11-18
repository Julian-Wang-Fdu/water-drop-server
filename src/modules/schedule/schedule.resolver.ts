
import { FindOptionsWhere } from 'typeorm';
import { Schedule } from './models/schedule.entity';
import {
  CARD_DEPLETE,
  CARD_EXPIRED,
  CARD_NOT_EXIST,
  CARD_RECORD_EXIST,
  COURSE_DEL_FAIL,
  COURSE_NOT_EXIST,
  SCHEDULE_CREATE_FAIL,
  SCHEDULE_HAD_SUBSCRIBE,
  SCHEDULE_NOT_EXIST,
  SUBSCRIBE_FAIL,
} from './../../common/constants/code';
import { Result } from '@/common/dto/result.type';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SUCCESS } from '@/common/constants/code';
import { ScheduleResult, ScheduleResults } from './dto/result-schedule.output';
import { ScheduleType } from './dto/schedule.type';
import { ScheduleService } from './schedule.service';
import * as _ from 'lodash';
import { CourseService } from '../course/course.service';
import * as dayjs from 'dayjs';
import { OrderTimeType } from '../course/dto/common.type';
import { CardRecordService } from '../cardRecord/card-record.service';
import { OrganizationResults } from '../organization/dto/result-organization.output';
import { OrganizationType } from '../organization/dto/organization.type';
import { CardType } from '@/common/constants/enmu';
import { ScheduleRecordService } from '../schedule-record/schedule-record.service';
import { GqlAuthGuard } from '@/guards/auth.guard';
import { CurUserId } from '@/decorators/current-user.decorator';
import { CurOrgId } from '@/decorators/current-org.decorator';

/**
 * 课程表
 */
@Resolver(() => ScheduleType)
@UseGuards(GqlAuthGuard)
export class ScheduleResolver {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly courseService: CourseService,
    private readonly scheduleRecordService: ScheduleRecordService,
    private readonly cardRecordService: CardRecordService,
  ) {}

  @Query(() => ScheduleResult)
  async getScheduleInfo(@Args('id') id: string): Promise<ScheduleResult> {
    const result = await this.scheduleService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: 'Get schedule success',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: 'Course not exist',
    };
  }

  /**
   * 开始排课
   */
  @Mutation(() => Result, { description: 'Start course scheduling' })
  async autoCreateSchedule(
    @Args('startDay') startDay: string,
    @Args('endDay') endDay: string,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
  ): Promise<Result> {
    // 1 获取到当前门店下的所有课程
    const [courses] = await this.courseService.findCourses({
      where: {
        org: {
          id: orgId,
        },
      },
      start: 0,
      length: 100,
    });
    const schedules = [];
    // 2 循环课程，并拿到每个课程的可约时间
    for (const course of courses) {
      // {"week":"monday","orderTime":[{"key":7, "startTime":"", "endTime":""}]}]
      const reducibleTime = course.reducibleTime;
      const newReducibleTime: Record<string, OrderTimeType[]> = {};
      for (const rt of reducibleTime) {
        newReducibleTime[rt.week] = rt.orderTime;
      }
      let curDay = dayjs(startDay);
      // 3 从开始的日期到结束的日期，判断是周几，然后就用周几的排课规则（可约时间）
      while (curDay.isBefore(dayjs(endDay).add(1, 'd'))) {
        const curWeek = curDay.format('dddd').toLocaleLowerCase();
        const orderTime = newReducibleTime[curWeek];
        if (orderTime && orderTime.length > 0) {
          for (const ot of orderTime) {
            // 解决重复排课的问题
            const [oldSchedule] = await this.scheduleService.findSchedules({
              where: {
                org: {
                  id: orgId,
                },
                startTime: ot.startTime,
                endTime: ot.endTime,
                schoolDay: curDay.toDate(),
                course: {
                  id: course.id,
                },
              },
              start: 0,
              length: 10,
            });
            if (oldSchedule.length === 0) {
              const schedule = new Schedule();
              schedule.startTime = ot.startTime;
              schedule.endTime = ot.endTime;
              schedule.limitNumber = course.limitNumber;
              schedule.org = course.org;
              schedule.course = course;
              schedule.schoolDay = curDay.toDate();
              schedule.createdBy = userId;
              // 创建课程表实例
              const si = await this.scheduleService.createInstance(schedule);
              schedules.push(si);
            }
          }
        }
        curDay = curDay.add(1, 'd');
      }
    }
    const res = await this.scheduleService.batchCreate(schedules);
    if (res) {
      return {
        code: SUCCESS,
        message: `Create success，add ${schedules.length} courses.`,
      };
    }
    return {
      code: SCHEDULE_CREATE_FAIL,
      message: 'Create schedule fail',
    };
  }

  // 获得所有课程表
  @Query(() => ScheduleResults)
  async getSchedules(
    @Args('today') today: string,
    @CurOrgId() orgId: string,
  ): Promise<ScheduleResults> {
    const where: FindOptionsWhere<Schedule> = {
      schoolDay: dayjs(today).toDate(),
      org: {
        id: orgId,
      },
    };
    const [results, total] = await this.scheduleService.findAllSchedules({
      where,
    });
    return {
      code: SUCCESS,
      data: results,
      page: {
        total,
      },
      message: 'Get schedules success',
    };
  }

  // 删除课程表
  @Mutation(() => Result)
  async deleteSchedule(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.scheduleService.findById(id);
    if (result) {
      const delRes = await this.scheduleService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: 'Delete schedule success',
        };
      }
      return {
        code: COURSE_DEL_FAIL,
        message: 'Delete fail',
      };
    }
    return {
      code: COURSE_NOT_EXIST,
      message: 'Course not exist',
    };
  }

  /**
   * 获得当前学员可以约的课程
   */
  @Query(() => OrganizationResults, {
    description: 'Get available courses for current student',
  })
  async getCanSubscribeCourses(
    @CurUserId() userId: string,
  ): Promise<OrganizationResults> {
    // 1 获取当前学员有效的消费卡
    const cards = await this.cardRecordService.findValidCards(userId);
    if (!cards || cards.length === 0) {
      return {
        code: CARD_RECORD_EXIST,
        message: 'No available consume card',
      };
    }
    // 2 获取消费卡可以约的课
    const courses = cards.map((item) => item.course);
    // 3 去除重复的课程
    const cs = _.uniqBy(courses, 'id');
    // 4 对课程做分组，按照门店
    const orgObj: Record<string, OrganizationType> = {};
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      if (orgObj[c.org.id]) {
        orgObj[c.org.id].courses.push(c);
      } else {
        orgObj[c.org.id] = {
          ...c.org,
          courses: [c],
        };
      }
    }
    const orgs: OrganizationType[] = Object.values(orgObj);

    return {
      code: SUCCESS,
      message: 'Get courses success',
      data: orgs,
      page: {
        total: orgs.length,
      },
    };
  }

  @Query(() => ScheduleResults, {
    description: 'Get course schedule for next seven days',
  })
  async getSchedulesByCourse(
    @Args('courseId') courseId: string,
  ): Promise<ScheduleResults> {
    const [entities, count] =
      await this.scheduleService.findValidSchedulesForNext7Days(courseId);

    return {
      code: SUCCESS,
      message: 'Get success',
      data: entities,
      page: {
        total: count,
      },
    };
  }

  // 确认预约课程
  @Mutation(() => Result, {
    description: 'Confirm reservation',
  })
  async subscribeCourse(
    @Args('scheduleId') scheduleId: string,
    @Args('cardId') cardId: string,
    @CurUserId() userId: string,
  ) {
    // 第一步：校验
    const myCard = await this.cardRecordService.findById(cardId);
    if (!myCard) {
      return {
        code: CARD_NOT_EXIST,
        message: 'Card not exist',
      };
    }

    // 判断是否过期
    if (dayjs().isAfter(myCard.endTime)) {
      return {
        code: CARD_EXPIRED,
        message: 'Card expired',
      };
    }

    // 判断消费卡是否耗尽
    if (myCard.card.type === CardType.TIME && myCard.residueTime === 0) {
      return {
        code: CARD_DEPLETE,
        message: 'Card deplete',
      };
    }

    const schedule = await this.scheduleService.findById(scheduleId);
    // 校验是否存在该课程
    if (!schedule) {
      return {
        code: SCHEDULE_NOT_EXIST,
        message: 'Schedule not exist',
      };
    }

    // 校验是否重复约课
    const isHadSubscribe = await this.scheduleRecordService.isHadSubscribe(
      scheduleId,
      userId,
    );
    if (isHadSubscribe) {
      return {
        code: SCHEDULE_HAD_SUBSCRIBE,
        message: 'Do not reserve same period',
      };
    }

    // 第二步：创建预约记录
    const scheduleRecordId = await this.scheduleRecordService.create({
      subscribeTime: new Date(),
      student: {
        id: userId,
      },
      schedule: {
        id: scheduleId,
      },
      cardRecord: {
        id: cardId,
      },
      course: {
        id: schedule.course.id,
      },
      org: {
        id: schedule.org.id,
      },
    });

    if (!scheduleRecordId) {
      return {
        code: SUBSCRIBE_FAIL,
        message: 'reserve fail',
      };
    }

    // 第三步 销卡
    if (myCard.card.type === CardType.TIME) {
      const res = await this.cardRecordService.updateById(cardId, {
        residueTime: myCard.residueTime - 1,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: 'reserve success',
        };
      } else {
        await this.scheduleRecordService.deleteById(scheduleRecordId, userId);
        return {
          code: SUBSCRIBE_FAIL,
          message: 'reserve fail',
        };
      }
    }
    return {
      code: SUCCESS,
      message: 'reserve success',
    };
  }
}
