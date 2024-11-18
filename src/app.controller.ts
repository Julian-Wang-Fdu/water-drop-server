import { Controller, Get } from '@nestjs/common';
import { UserService } from './modules/user/user.service';

@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly userService:UserService){}

  //create a administer for test
  @Get('/create')
  async create():Promise<string>{
    return await this.userService.create({
      name:'水滴超级管理员',
      desc: '管理员',
      password:'123456',
      account: 'admin'
    });
  }
}

