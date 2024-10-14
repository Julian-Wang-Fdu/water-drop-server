import { Query, Resolver } from '@nestjs/graphql';
import { OSSType } from './dto/oss.type';
import { OSSService } from './oss.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/guards/auth.guard';

@Resolver()
@UseGuards(GqlAuthGuard)
export class OSSResolver {
  constructor(private readonly ossService: OSSService) {}

  @Query(() => OSSType, { description: 'get oss info' })
  async getOSSInfo(): Promise<OSSType> {
    return await this.ossService.getSignature();
  }
}