import { NOT_EMPTY, NOT_ENOUGH_LENGTH, SUCCESS, TOO_LONG, VALIDATE_ERROR } from "src/common/constants/code";
import { Result } from "src/common/dto/result.type";

const regex = /^[a-zA-Z0-9]+$/;

export const accountAndPwdValidate = (
  account: string,
  password: string,
): Result => {
  if (!account || !password) {
    return {
      code: NOT_EMPTY,
      message: 'Account or password cannot be empty',
    };
  }
  if(account.length<6||password.length<6){
    return{
        code: NOT_ENOUGH_LENGTH,
        message: "Account or password cannot be less than six characters"
    }
  }
  if(account.length>12||password.length>12){
    return{
        code: TOO_LONG,
        message: "Account or password cannot be more than twelve characters"
    }
  }
  if (!regex.test(account)) {
    return {
      code: VALIDATE_ERROR,
      message: 'Account can only contain letter or number',
    };
  }
  return {
    code: SUCCESS,
  };
};