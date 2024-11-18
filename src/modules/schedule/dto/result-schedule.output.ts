import { createResult, createResults } from "@/common/dto/result.type";
import { ScheduleType } from "./schedule.type";
import { ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ScheduleResult extends createResult(ScheduleType) {}

@ObjectType()
export class ScheduleResults extends createResults(ScheduleType) {}