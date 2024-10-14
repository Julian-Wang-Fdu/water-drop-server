import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrganizationType } from "./dto/organization.type";
import { GqlAuthGuard } from "@/guards/auth.guard";
import { OrganizationResult, OrganizationResults } from "./dto/result-organization.output";
import { OrganizationService } from "./organization.service";
import { OrgImageService } from "../orgImage/orgImage.service";
import { ORG_DEL_FAIL, ORG_FAIL, ORG_NOT_EXIST, SUCCESS } from "@/common/constants/code";
import { CurUserId } from "@/decorators/current-user.decorator";
import { OrganizationInput } from "./dto/organization.input";
import { Result } from "@/common/dto/result.type";
import { PageInput } from "@/common/dto/page.input";
import { FindOptionsWhere, Like } from "typeorm";
import { Organization } from "./modules/organization.entity";


@Resolver(() => OrganizationType)
@UseGuards(GqlAuthGuard)
export class OrganizationResolver {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly orgImageService: OrgImageService,
  ) {}

  @Query(() => OrganizationResult)
  async getOrganizationInfo(
    @Args('id') id: string,
  ): Promise<OrganizationResult> {
    const result = await this.organizationService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: 'Get store information success',
      };
    }
    return {
      code: ORG_NOT_EXIST,
      message: 'Store not exist',
    };
  }

  @Mutation(() => OrganizationResult)
  async commitOrganization(
    @Args('params') params: OrganizationInput,
    @CurUserId() userId: string,
    @Args('id', { nullable: true }) id?: string,
  ): Promise<Result> {
    if (id) {
      const organization = await this.organizationService.findById(id);
      if (!organization) {
        return {
          code: ORG_NOT_EXIST,
          message: 'Store not exist',
        };
      }
      const delRes = await this.orgImageService.deleteByOrg(id);
      if (!delRes) {
        return {
          code: ORG_FAIL,
          message: 'Delete image fail',
        };
      }
      const res = await this.organizationService.updateById(id, {
        ...params,
        updatedBy: userId,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: 'Update success',
        };
      }
    }
    const res = await this.organizationService.create({
      ...params,
      createdBy: userId,
    });
    if (res) {
      return {
        code: SUCCESS,
        message: 'Create store success',
      };
    }
    return {
      code: ORG_FAIL,
      message: 'Create store fail',
    };
  }

  @Query(() => OrganizationResults)
  async getOrganizations(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<OrganizationResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Organization> = { createdBy: userId };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    const [results, total] = await this.organizationService.findOrganizations({
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
      message: 'Get store list success',
    };
  }

  @Mutation(() => Result)
  async deleteOrganization(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.organizationService.findById(id);
    if (result) {
      const delRes = await this.organizationService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: 'Delete store success',
        };
      }
      return {
        code: ORG_DEL_FAIL,
        message: 'Delete store fail',
      };
    }
    return {
      code: ORG_NOT_EXIST,
      message: 'Store not exit',
    };
  }
}
