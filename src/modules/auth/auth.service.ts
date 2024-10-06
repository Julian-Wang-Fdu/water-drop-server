import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { Result } from "src/common/dto/result.type";
import { accountAndPwdValidate } from "src/utils";
import { CREATE_ACCOUNT_FAIL, LOGIN_ERROR, SUCCESS } from "src/common/constants/code";
import * as md5 from 'md5';


@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(account:string,password:string): Promise<Result> {
    const result = accountAndPwdValidate(account, password);
    if (result.code !== SUCCESS) {
      return result;
    }
    const user = await this.userService.findByAccount(account)
    //if user not exist, then create a new one
    if(!user){
        const res = await this.userService.create({
            account,
            password: md5(password)
        });
        if(res){
            return{
                code: SUCCESS,
                message: 'Create account success'
            }
        }
        return{
            code: CREATE_ACCOUNT_FAIL,
            message: 'Create account fail'
        }
    }
    if(user.password == md5(password)){
        return{
            code: SUCCESS,
            message: 'Login success'
        }
    }
    return {
        code: LOGIN_ERROR,
        message: 'The account name and password not match'
    };
  }


}