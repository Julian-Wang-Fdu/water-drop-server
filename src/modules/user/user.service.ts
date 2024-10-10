import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial,Repository } from "typeorm";
import { User } from "./models/user.entity";

@Injectable()
export class UserService{

    constructor(
        @InjectRepository(User) private UserRepository: Repository<User>,
    ){}

  // create a new user and return user id
  async create(entity: DeepPartial<User>): Promise<string> {
    const res = await this.UserRepository.insert(entity);
    if (res && res.raw.affectedRows > 0) {
      return res.identifiers[0].id;
    }
    return "false";
  }

  // use id to find a user
  async find(id: string): Promise<User> {
    const res = await this.UserRepository.findOne({
      where: {
        id,
      },
    });
    return res;
  }
  
  //checkout whether an account is already exist
  async findByAccount(account:string): Promise<User>{
    const res = await this.UserRepository.findOne({
      where: {
        account,
      },
    });
    return res;
  }

 // delete a user
  async del(id: string): Promise<boolean> {
    const res = await this.UserRepository.delete(id);
    if (res.affected > 0) {
      return true;
    }
    return false;
  } 

  // update user's info
  async update(id: string, entity: DeepPartial<User>): Promise<boolean> {
    const res = await this.UserRepository.update(id, entity);
    if (res.affected > 0) {
      return true;
    }
    return false;
  }
}