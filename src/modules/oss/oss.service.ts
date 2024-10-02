import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as OSS from 'ali-oss';
import { OSSType } from './dto/oss.type';

@Injectable()
export class OSSService {
  /**
   * @description get OSS signature for uploading
   * @see https://help.aliyun.com/document_detail/31926.html
   * @return {*}  {Promise<OSSType>}
   * @memberof OSSService
   */
  async getSignature(): Promise<OSSType> {
    const config = {
      accessKeyId: process.env.ACCESS_KEY,
      accessKeySecret: process.env.ACCESS_KEY_SECRET,
      bucket: 'water-drop-capstone',
      dir: 'images/',
    };

    const client = new OSS(config);

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const policy = {
      expiration: date.toISOString(), // expiration time
      conditions: [
        ['content-length-range', 0, 1048576000], // file size limit
      ],
    };

    // bucket domain
    const host = `https://${config.bucket}.${
      (await client.getBucketLocation()).location
    }.aliyuncs.com`.toString();
    //signature
    const formData = await client.calculatePostSignature(policy);
    //return 
    const params = {
      expire: dayjs().add(1, 'days').unix().toString(),
      policy: formData.policy,
      signature: formData.Signature,
      accessId: formData.OSSAccessKeyId,
      host,
      dir: 'images/',
    };

    return params;
  }
}