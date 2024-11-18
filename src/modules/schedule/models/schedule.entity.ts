import { CommonEntity } from "@/common/entity/common.entity";
import { Course } from "@/modules/course/module/course.entity";
import { Organization } from "@/modules/organization/modules/organization.entity";
import { ScheduleRecord } from "@/modules/schedule-record/models/schedule-record.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

/**
 * 课程表
 */
@Entity('schedule')
export class Schedule extends CommonEntity {
  @Column({
    comment: '上课日期',
    nullable: true,
    type: 'timestamp',
  })
  schoolDay: Date;

  @Column({
    comment: '开始时间',
    nullable: true,
  })
  startTime: string;

  @Column({
    comment: '结束时间',
    nullable: true,
  })
  endTime: string;

  @Column({
    comment: '人数限制',
    nullable: true,
  })
  limitNumber: number;

  @ManyToOne(() => Organization, {
    cascade: true,
  })
  org: Organization;

  @ManyToOne(() => Course, {
    cascade: true,
  })
  course: Course;


  @OneToMany(() => ScheduleRecord, (scheduleRecord) => scheduleRecord.schedule)
  scheduleRecords?: ScheduleRecord[];
}
