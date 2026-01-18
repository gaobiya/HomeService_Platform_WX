import { request } from '../utils/request'

/**
 * 创建评价
 */
export function createRating(orderId, raterId, rateeId, rating, comment) {
  return request('/order/rate', 'POST', {
    orderId,
    raterId,
    rateeId,
    rating,
    comment
  })
}

/**
 * 获取订单评价
 */
export function getOrderRatings(orderId) {
  return request(`/order/rate/order/${orderId}`, 'GET')
}
