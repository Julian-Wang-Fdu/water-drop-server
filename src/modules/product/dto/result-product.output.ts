import { createResult, createResults } from "@/common/dto/result.type";
import { ObjectType } from "@nestjs/graphql";
import { ProductType } from "./product.type";

@ObjectType()
export class ProductResult extends createResult(ProductType) {}

@ObjectType()
export class ProductResults extends createResults(ProductType) {}

