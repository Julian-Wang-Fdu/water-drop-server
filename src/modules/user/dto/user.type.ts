import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id?: string;
  @Field({ description: 'nickname' })
  name?: string;
  @Field({ description: 'description' })
  desc: string;
  @Field({ description: 'user account' })
  account?: string;
  @Field({ description: 'user password' })
  password: string;
  @Field({ description: 'profile photo', nullable: true })
  avatar?: string;
}