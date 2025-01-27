import { CardType } from "@/modules/card/dto/card.type";
import { CourseType } from "@/modules/course/dto/course.type";
import { OrganizationType } from "@/modules/organization/dto/organization.type";
import { Organization } from "@/modules/organization/modules/organization.entity";
import { StudentType } from "@/modules/student/dto/student.type";
import { Field, ObjectType } from "@nestjs/graphql";

/**
 * 消费卡
 */
@ObjectType()
export class CardRecordType {
  @Field({
    description: 'id',
  })
  id: string;

  @Field({
    description: '开始时间',
    nullable: true,
  })
  startTime: Date;

  @Field({
    description: '结束时间',
    nullable: true,
  })
  endTime: Date;

  @Field({
    description: '购买时间',
    nullable: true,
  })
  buyTime: Date;

  @Field({
    description: '剩余次数',
    nullable: true,
  })
  residueTime: number;

  @Field({
    description: '状态',
    nullable: true,
  })
  status?: string;

  @Field(() => CardType, { nullable: true, description: '关联卡实体' })
  card: CardType;

  @Field(() => CourseType, { nullable: true, description: '课程' })
  course: CourseType;

  @Field(() => StudentType, { nullable: true, description: '学员' })
  student: StudentType;

  @Field(() => OrganizationType, { nullable: true, description: '门店' })
  org: Organization;
}