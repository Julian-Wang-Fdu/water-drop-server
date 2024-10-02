import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Result {
  @Field(() => Int)
  code: number;
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => String, { nullable: true })
  data?: string;
}