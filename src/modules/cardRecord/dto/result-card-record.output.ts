import { createResult, createResults } from "@/common/dto/result.type";
import { ObjectType } from "@nestjs/graphql";
import { CardRecordType } from "./card-record.type";

@ObjectType()
export class CardRecordResult extends createResult(CardRecordType) {}

@ObjectType()
export class CardRecordResults extends createResults(CardRecordType) {}