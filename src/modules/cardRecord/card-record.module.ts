import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardRecord } from "./models/card-record.entity";
import { CardModule } from "../card/card.module";
import { StudentModule } from "../student/student.module";
import { CardRecordService } from "./card-record.service";
import { CardRecordResolver } from "./card-record.resolver";

@Module({
  imports: [TypeOrmModule.forFeature([CardRecord]), CardModule, StudentModule],
  providers: [CardRecordService, CardRecordResolver],
  exports: [CardRecordService],
})
export class CardRecordModule {}