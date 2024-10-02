import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserService } from "./user.service";
import { UserInput } from "./dto/user-input";
import { UserType } from "./dto/user.type";
import { SUCCESS, UPDATE_ERROR } from "src/common/constants/code";
import { Result } from "src/common/dto/result.type";

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => Boolean, { description: 'create a new user' })
  async create(@Args('params') params: UserInput): Promise<boolean> {
    return await this.userService.create(params);
  }

  @Query(() => UserType, { description: 'use id to find a user' })
  async find(@Args('id') id: string): Promise<UserType> {
    return await this.userService.find(id);
  }
  
  @Mutation(() => Result, { description: 'update a user information' })
  async updateUserInfo(
    @Args('id') id: string,
    @Args('params') params: UserInput,
  ): Promise<Result> {
    const res = await this.userService.update(id, params);
    if (res) {
      return {
        code: SUCCESS,
        message: 'update success',
      };
    }
    return {
      code: UPDATE_ERROR,
      message: 'update failed',
    };
  }

  @Mutation(() => Boolean, { description: 'delete a user' })
  async del(@Args('id') id: string): Promise<boolean> {
    return await this.userService.del(id);
  }
}
