import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { Result } from "src/common/dto/result.type";

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService){}

  @Mutation(() => Result, { description: 'login or register' })
  async login(
    @Args('account') account: string,
    @Args('password') password: string,
  ): Promise<Result> {
    return this.authService.login(account,password)
  }


}