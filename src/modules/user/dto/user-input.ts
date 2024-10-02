import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserInput {
  @Field({ description: 'nickname' })
  name?: string;
  @Field({ description: 'brief introduction' })
  desc: string;
  @Field({ description: 'profile photo' })
  avatar: string;
}