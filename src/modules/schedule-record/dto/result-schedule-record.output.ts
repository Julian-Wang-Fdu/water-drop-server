import { createResult, createResults } from "@/common/dto/result.type";
import { ObjectType } from "@nestjs/graphql";
import { ScheduleRecordType } from "./schedule-record.type";

@ObjectType()
export class ScheduleRecordResult extends createResult(ScheduleRecordType) {}

@ObjectType()
export class ScheduleRecordResults extends createResults(ScheduleRecordType) {}
