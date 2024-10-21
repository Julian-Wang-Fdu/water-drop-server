import { CommonEntity } from "@/common/entity/common.entity";
import { OrgImage } from "@/modules/orgImage/modules/orgImage.entity";
import { IsNotEmpty } from "class-validator";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('organization')
export class Organization extends CommonEntity {
  @Column({
    comment: '营业执照',
  })
  @IsNotEmpty()
  businessLicense: string;

  @Column({
    comment: '法人身份证正面',
  })
  @IsNotEmpty()
  identityCardFrontImg: string;

  @Column({
    comment: '法人身份证反面',
  })
  @IsNotEmpty()
  identityCardBackImg: string;

  @Column({
    type: 'text',
    comment: '标签 以，隔开',
    nullable: true,
  })
  tags: string;

  @Column({
    type: 'text',
    comment: '简介',
    nullable: true,
  })
  description: string;

  @Column({
    comment: '机构名',
    nullable: true,
    default: '',
  })
  name: string;

  @Column({
    comment: 'logo',
    nullable: true,
  })
  logo: string;

  @Column({
    comment: 'address',
    nullable: true,
  })
  address: string;

  @Column({
    comment: 'longitude',
    nullable: true,
  })
  longitude: string;

  @Column({
    comment: 'latitude',
    nullable: true,
  })
  latitude: string;

  @Column({
    comment: 'telephone',
    nullable: true,
  })
  tel: string;

  @OneToMany(() => OrgImage, (orgImage) => orgImage.orgIdForFront, {
    cascade: true,
  })
  orgFrontImg?: OrgImage[];

  @OneToMany(() => OrgImage, (orgImage) => orgImage.orgIdForRoom, {
    cascade: true,
  })
  orgRoomImg?: OrgImage[];

  @OneToMany(() => OrgImage, (orgImage) => orgImage.orgIdForOther, {
    cascade: true,
  })
  orgOtherImg?: OrgImage[];


}
