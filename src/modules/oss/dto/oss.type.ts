import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OSSType {
  @Field({ description: 'expiration time' })
  expire: string;
  @Field({ description: 'strategy' })
  policy: string;
  @Field({ description: 'sign' })
  signature: string;
  @Field({ description: 'key' })
  accessId: string;
  @Field({ description: 'host' })
  host: string;
  @Field({ description: 'folder' })
  dir: string;
}