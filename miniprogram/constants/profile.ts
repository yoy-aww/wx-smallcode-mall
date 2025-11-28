/**
 * Constants for the profile page
 */

export const MEMBERSHIP_LEVELS = {
  bronze: '铜卡会员',
  silver: '银卡会员',
  gold: '金卡会员',
  platinum: '白金会员'
} as const;

export const ORDER_STATUS_LABELS = {
  pending_payment: '待付款',
  pending_shipment: '待发货',
  pending_receipt: '待收货',
  pending_review: '待评价',
  refund_aftersales: '退款售后'
} as const;

export const ORDER_STATUS_ICONS = {
  pending_payment: 'payment',
  pending_shipment: 'shipment',
  pending_receipt: 'receipt',
  pending_review: 'review',
  refund_aftersales: 'refund'
} as const;

export const ACCOUNT_METRIC_LABELS = {
  balance: '余额',
  points: '积分',
  cards: '卡',
  coupons: '优惠券'
} as const;

export const LOGIN_PROMPT_MESSAGE = '登录手机号，订单管理更轻松，优惠信息不错过';

export const DEFAULT_AVATAR = '/images/placeholders/default-avatar.svg';

export const SERVICE_MENU_ITEMS = [
  {
    id: 'task-center',
    title: '任务中心',
    icon: 'task',
    page: '/pages/task-center/index'
  },
  {
    id: 'delivery-address',
    title: '收货地址',
    icon: 'address',
    page: '/pages/address/index'
  },
  {
    id: 'call-merchant',
    title: '拨打商家电话',
    icon: 'phone',
    action: 'call'
  },
  {
    id: 'personal-info',
    title: '个人信息',
    icon: 'info',
    page: '/pages/personal-info/index'
  },
  {
    id: 'account-security',
    title: '账号与安全',
    icon: 'security',
    page: '/pages/account-security/index'
  }
] as const;