import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CardType } from "./dto/card.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/guards/auth.guard";
import { CardResult, CardResults } from "./dto/result-card.output";
import { CardService } from "./card.service";
import { CARD_CREATE_FAIL, CARD_DEL_FAIL, CARD_NOT_EXIST, CARD_UPDATE_FAIL, SUCCESS } from "@/common/constants/code";
import { CardInput } from "./dto/card.input";
import { CurUserId } from "@/decorators/current-user.decorator";
import { CurOrgId } from "@/decorators/current-org.decorator";
import { Result } from "@/common/dto/result.type";
import { FindOptionsWhere, Like } from "typeorm";
import { Card } from "./modules/card.entity";

@Resolver(() => CardType)
@UseGuards(GqlAuthGuard)
export class CardResolver {
  constructor(private readonly cardService: CardService) {}

  @Query(() => CardResult)
  async getCardInfo(@Args('id') id: string): Promise<CardResult> {
    const result = await this.cardService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: 'Get card success',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: 'Card not exist',
    };
  }

  @Mutation(() => CardResult)
  async commitCardInfo(
    @Args('params') params: CardInput,
    @Args('courseId') courseId: string,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<Result> {
    if (!id) {
      const res = await this.cardService.create({
        ...params,
        org: {
          id: orgId,
        },
        course: {
          id: courseId,
        },
        createdBy: userId,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: 'Create success',
        };
      }
      return {
        code: CARD_CREATE_FAIL,
        message: 'Create fail',
      };
    }
    const card = await this.cardService.findById(id);
    if (card) {
      const res = await this.cardService.updateById(card.id, {
        ...params,
        updatedBy: userId,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: 'Update success',
        };
      }
      return {
        code: CARD_UPDATE_FAIL,
        message: 'Update fail',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: 'Card not exist',
    };
  }

  @Query(() => CardResults)
  async getCards(
    @Args('courseId') courseId: string,
    @CurUserId() userId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<CardResults> {
    const where: FindOptionsWhere<Card> = {
      createdBy: userId,
      course: {
        id: courseId,
      },
    };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results] = await this.cardService.findCards({
      where,
    });
    return {
      code: SUCCESS,
      data: results,
      message: 'Get card list success',
    };
  }

  @Mutation(() => Result)
  async deleteCard(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.cardService.findById(id);
    if (result) {
      const delRes = await this.cardService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: 'Delete success',
        };
      }
      return {
        code: CARD_DEL_FAIL,
        message: 'Delete fail',
      };
    }
    return {
      code: CARD_NOT_EXIST,
      message: 'Card not exist',
    };
  }
}
