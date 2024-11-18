import { CommonEntity } from "@/common/entity/common.entity";
import { Card } from "@/modules/card/modules/card.entity";
import { Course } from "@/modules/course/module/course.entity";
import { Organization } from "@/modules/organization/modules/organization.entity";
import { Student } from "@/modules/student/modules/student.entity";
import { Column, Entity, ManyToOne } from "typeorm";

/**
 * 个人的消费卡
 */
@Entity('card_record')
export class CardRecord extends CommonEntity {
  @Column({
    comment: '开始时间',
    type: 'timestamp',
    nullable: true,
  })
  startTime: Date;

  @Column({
    comment: '结束时间',
    type: 'timestamp',
    nullable: true,
  })
  endTime: Date;

  @Column({
    comment: '购买时间',
    type: 'timestamp',
    nullable: true,
  })
  buyTime: Date;

  @Column({
    comment: '剩余次数',
    nullable: true,
  })
  residueTime: number;

  @ManyToOne(() => Card, {
    cascade: true,
  })
  card: Card;

  @ManyToOne(() => Course, {
    cascade: true,
  })
  course: Course;

  @ManyToOne(() => Organization, {
    cascade: true,
  })
  org: Organization;

  @ManyToOne(() => Student, {
    cascade: true,
  })
  student: Student;
}
