import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardService } from "./card.service";
import { Card } from "./modules/card.entity";
import { CardResolver } from "./card.resolver";

@Module({
  imports: [TypeOrmModule.forFeature([Card])],
  providers: [CardService, CardResolver],
  exports: [CardService],
})
export class CardModule {}