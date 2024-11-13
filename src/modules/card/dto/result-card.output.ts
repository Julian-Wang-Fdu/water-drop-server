import { createResult, createResults } from "@/common/dto/result.type";
import { ObjectType } from "@nestjs/graphql";
import { CardType } from "./card.type";

@ObjectType()
export class CardResult extends createResult(CardType) {}

@ObjectType()
export class CardResults extends createResults(CardType) {}