import { Entity,Column, PrimaryGeneratedColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";

@Entity('user')
export class User{

    @PrimaryGeneratedColumn('uuid')
    id:string;
    @Column({
        comment: 'nickname',
        default: ''
    })
    @IsNotEmpty()
    name: string;

    @Column({
        comment: 'description',
        default: ''
    })
    desc:string;
    
    @Column({
        comment:'account number',
        nullable: true
        }) 
    account: string;

    @Column({
        comment: 'password',
        default: ''
    })
    password:string;

    @Column({
    comment: 'profile photo',
    nullable: true,
   })
    avatar: string;
    
}