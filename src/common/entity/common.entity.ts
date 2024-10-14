import { IsDate, IsOptional, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, DeleteDateColumn, PrimaryGeneratedColumn } from "typeorm";


export class CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    comment: 'created time',
    type: 'timestamp',
  })
  createdAt: Date;

  @Column({
    comment: 'creator',
    nullable: true,
  })
  @IsOptional()
  createdBy: string;

  @Column({
    comment: 'modify time',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date;

  @Column({
    comment: 'editor',
    nullable: true,
  })
  @IsOptional()
  updatedBy: string;

  @Column({
    comment: 'delete time',
    type: 'timestamp',
    nullable: true,
  })
  @DeleteDateColumn()
  @IsDate()
  @IsOptional()
  deletedAt: Date;

  @Column({
    comment: 'who delete',
    nullable: true,
  })
  @IsOptional()
  deletedBy: string;

  @BeforeInsert()
  setCreatedAt() {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  async validateBeforeInsert() {
    await validateOrReject(this);
  }

  @BeforeUpdate()
  async validateBeforeUpdate() {
    await validateOrReject(this, { skipMissingProperties: true });
  }
}
