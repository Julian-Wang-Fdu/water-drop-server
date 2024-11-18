// 消费卡类型
export enum CardType {
  TIME = 'time',
  DURATION = 'duration',
}

// 商品状态
export enum ProductStatus {
  LIST = 'LIST', // 上架
  UN_LIST = 'UN_LIST', // 下架
}

// 消费卡状态
export enum CardStatus {
  VALID = 'VALID', // 有效
  EXPIRED = 'EXPIRED', // 过期
  DEPLETE = 'DEPLETE', // 耗尽了
}

// 课程表状态
export enum ScheduleStatus {
  NO_DO = 'NO_DO', // 未开始
  DOING = 'DOING', // 正在上课中
  FINISH = 'FINISH', // 上完课了
  COMMENTED = 'COMMENTED', // 已评价
  CANCEL = 'CANCEL', // 已取消
}