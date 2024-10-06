import { ConsoleLogger, Module } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/models/user.entity";

@Module({
  imports:[TypeOrmModule.forFeature([User])],
  providers: [
    ConsoleLogger,
    AuthService,
    AuthResolver,
    UserService,
  ],
  exports: [],
})
export class AuthModule {}