import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleRecord } from "./models/schedule-record.entity";
import { CardRecordModule } from "../cardRecord/card-record.module";
import { ScheduleRecordResolver } from "./schedule-record.resolve";
import { ScheduleRecordService } from "./schedule-record.service";

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleRecord]), CardRecordModule],
  providers: [ScheduleRecordService, ScheduleRecordResolver],
  exports: [ScheduleRecordService],
})
export class ScheduleRecordModule {}