import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProductType } from "./dto/product.type";
import { GqlAuthGuard } from "@/guards/auth.guard";
import { UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductResult, ProductResults } from "./dto/result-product.output";
import { PRODUCT_CREATE_FAIL, PRODUCT_DEL_FAIL, PRODUCT_NOT_EXIST, PRODUCT_UPDATE_FAIL, SUCCESS } from "@/common/constants/code";
import { PartialProductInput } from "./dto/product.input";
import { CurUserId } from "@/decorators/current-user.decorator";
import { CurOrgId } from "@/decorators/current-org.decorator";
import { Result } from "@/common/dto/result.type";
import { ProductStatus } from "@/common/constants/enmu";
import { PageInput } from "@/common/dto/page.input";
import { Product } from "./modules/product.entity";
import { FindOptionsWhere, Like } from "typeorm";

@Resolver(() => ProductType)
@UseGuards(GqlAuthGuard)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => ProductResult)
  async getProductInfo(@Args('id') id: string): Promise<ProductResult> {
    const result = await this.productService.findById(id);
    if (result) {
      return {
        code: SUCCESS,
        data: result,
        message: 'Get product list success',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: 'Product not exist',
    };
  }

  @Mutation(() => ProductResult)
  async commitProductInfo(
    @Args('params') params: PartialProductInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('id', { nullable: true }) id: string,
  ): Promise<Result> {
    if (!id) {
      const res = await this.productService.create({
        ...params,
        createdBy: userId,
        cards: [],
        // 初始化当前的库存为总库存数
        curStock: params.stock,
        status: ProductStatus.UN_LIST,
        org: {
          id: orgId,
        },
      });
      if (res) {
        return {
          code: SUCCESS,
          message: '创建成功',
        };
      }
      return {
        code: PRODUCT_CREATE_FAIL,
        message: '创建失败',
      };
    }
    const product = await this.productService.findById(id);
    if (product) {
      const newProduct = {
        ...params,
        cards: [],
        updatedBy: userId,
      };
      if (params.cards && params.cards?.length > 0) {
        newProduct.cards = params.cards.map((item) => ({
          id: item,
        }));
      } else {
        // 防止消费卡被清空
        newProduct.cards = product.cards;
      }
      const res = await this.productService.updateById(product.id, newProduct);
      if (res) {
        return {
          code: SUCCESS,
          message: '更新成功',
        };
      }
      return {
        code: PRODUCT_UPDATE_FAIL,
        message: '更新失败',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: '商品信息不存在',
    };
  }

  @Query(() => ProductResults)
  async getProducts(
    @Args('page') page: PageInput,
    @CurUserId() userId: string,
    @CurOrgId() orgId: string,
    @Args('name', { nullable: true }) name?: string,
  ): Promise<ProductResults> {
    const { pageNum, pageSize } = page;
    const where: FindOptionsWhere<Product> = { createdBy: userId };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (orgId) {
      where.org = {
        id: orgId,
      };
    }
    const [results, total] = await this.productService.findProducts({
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
      message: 'Get product info success',
    };
  }

  @Mutation(() => Result)
  async deleteProduct(
    @Args('id') id: string,
    @CurUserId() userId: string,
  ): Promise<Result> {
    const result = await this.productService.findById(id);
    if (result) {
      const delRes = await this.productService.deleteById(id, userId);
      if (delRes) {
        return {
          code: SUCCESS,
          message: 'Delete success',
        };
      }
      return {
        code: PRODUCT_DEL_FAIL,
        message: 'Delete fail',
      };
    }
    return {
      code: PRODUCT_NOT_EXIST,
      message: 'Product not exist',
    };
  }

  
}
