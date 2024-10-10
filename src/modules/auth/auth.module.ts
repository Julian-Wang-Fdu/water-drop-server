import { ConsoleLogger, Module } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/models/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { JWT_SECRET } from "src/common/constants/keys";

@Module({
  imports:[
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: {
        expiresIn: 60 * 60 * 24 * 7 + 's',
      },
    }),
    TypeOrmModule.forFeature([User])
  ],
  providers: [
    JwtStrategy,
    ConsoleLogger,
    AuthService,
    AuthResolver,
    UserService,
  ],
  exports: [],
})
export class AuthModule {}