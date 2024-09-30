import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial,Repository } from "typeorm";
import { User } from "./models/user.entity";

@Injectable()
export class UserService{

    constructor(
        @InjectRepository(User) private UserRepository: Repository<User>,
    ){}

    // create a new user
  async create(entity: DeepPartial<User>): Promise<boolean> {
    const res = await this.UserRepository.insert(entity);
    if (res && res.raw.affectedRows > 0) {
      return true;
    }
    return false;
  }

  
}