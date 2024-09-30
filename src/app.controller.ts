import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './modules/user/user.service';

@Controller()
export class AppController {
  constructor(private readonly userService:UserService){}

  @Get('/create')
  async create():Promise<boolean>{
    return await this.userService.create({
      name:'水滴超级管理员',
      desc: '管理员',
      password:'123456',
      account: 'admin'
    });
  }
}

