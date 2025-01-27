import { CommonEntity } from "@/common/entity/common.entity";
import { Column, Entity } from "typeorm";

@Entity('student')
export class Student extends CommonEntity {
  @Column({
    comment: '昵称',
    default: '',
  })
  name: string;

  @Column({
    comment: '手机号',
    nullable: true,
  })
  tel: string;

  @Column({
    comment: '头像',
    nullable: true,
  })
  avatar: string;

  @Column({
    comment: '密码',
  })
  password: string;

  @Column({
    comment: '账户',
  })
  account: string;

  @Column({
    comment: 'openid',
    nullable: true,
  })
  openid?: string;
}
