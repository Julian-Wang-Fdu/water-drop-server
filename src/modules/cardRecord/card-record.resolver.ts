import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CardRecordType } from "./dto/card-record.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/guards/auth.guard";
import { CardRecordResult, CardRecordResults } from "./dto/result-card-record.output";
import { CardRecordService } from "./card-record.service";
import { CARD_NOT_EXIST, COURSE_DEL_FAIL, COURSE_NOT_EXIST, SUCCESS } from "@/common/constants/code";
import { PageInput } from "@/common/dto/page.input";
import { CurUserId } from "@/decorators/current-user.decorator";
import { FindOptionsWhere } from "typeorm";
import { CardRecord } from "./models/card-record.entity";
import { CardStatus, CardType } from "@/common/constants/enmu";
import dayjs from "dayjs";
import { Result } from "@/common/dto/result.type";

@Resolver(() => CardRecordType)
@UseGuards(GqlAuthGuard)
export class CardRecordResolver {
  constructor(private readonly cardRecordService: CardRecordService) {}

  @Query(() => CardRecordResult)
  async getCardRecordInfo(@Args('id') id: string): Promise<CardRecordResult> {
    const result = await this.cardRecordService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: 'Get record success',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: 'Card not exist',
    };
  }

  @Query(() => CardRecordResults, { description: 'Get personal card record' })
  async getCardRecordsForH5(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
  ): Promise<CardRecordResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<CardRecord> = {
      student: {
        id: userId,
      },
    };
    const [results, total] = await this.cardRecordService.findCardRecords({
      start: (pageNum - 1) * pageSize,
      length: pageSize,
      where,
    });

    const newRes = results.map((c) => {
      let status = CardStatus.VALID;
      // 过期了
      if (dayjs().isAfter(c.endTime)) {
        status = CardStatus.EXPIRED;
      }

      // 耗尽了
      if (c.card.type === CardType.TIME && c.residueTime === 0) {
        status = CardStatus.DEPLETE;
      }
      return {
        ...c,
        status,
      };
    });

    return {
      code: SUCCESS,
      data: newRes,
      page: {
        pageNum,
        pageSize,
        total,
      },
      message: 'Get success',
    };
  }

  @Query(() => CardRecordResults)
  async getCardRecords(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
  ): Promise<CardRecordResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<CardRecord> = { createdBy: userId };
    const [results, total] = await this.cardRecordService.findCardRecords({
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
      message: 'Get success',
    };
  }

  @Mutation(() => Result)
  async deleteCardRecord(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.cardRecordService.findById(id);
    if (result) {
      const delRes = await this.cardRecordService.deleteById(id, userId);
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
      message: 'Course not exist',
    };
  }

  // 获取当前学员在某个课程上可以用的消费卡
  @Query(() => CardRecordResults, {
    description: 'Get available card for current student',
  })
  async getUseCardRecordsByCourse(
    @Args('courseId') courseId: string,
    @CurUserId() userId: string,
  ): Promise<CardRecordResults> {
    const [cards, total] = await this.cardRecordService.findUseCards(
      userId,
      courseId,
    );

    return {
      code: SUCCESS,
      message: 'Get success',
      data: cards,
      page: {
        total,
      },
    };
  }
}
