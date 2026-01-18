import { request } from '../utils/request'

/**
 * 创建订单
 */
export function createOrder(customerId, orderData) {
  return request(`/order/create?customerId=${customerId}`, 'POST', orderData)
}

/**
 * 获取订单详情
 */
export function getOrderDetail(orderId) {
  return request(`/order/${orderId}`, 'GET')
}

/**
 * 获取客户订单列表
 */
export function getCustomerOrders(customerId, status) {
  const url = status ? `/order/list/customer?customerId=${customerId}&status=${status}` : `/order/list/customer?customerId=${customerId}`
  return request(url, 'GET')
}

/**
 * 获取服务员订单列表
 */
export function getWorkerOrders(workerId, status) {
  const url = status ? `/order/list/worker?workerId=${workerId}&status=${status}` : `/order/list/worker?workerId=${workerId}`
  return request(url, 'GET')
}

/**
 * 服务员接单
 */
export function acceptOrder(orderId, workerId) {
  return request(`/order/accept?orderId=${orderId}&workerId=${workerId}`, 'PUT')
}

/**
 * 完成订单
 */
export function completeOrder(orderId) {
  return request(`/order/complete?orderId=${orderId}`, 'PUT')
}

/**
 * 拒绝订单
 */
export function rejectOrder(orderId, workerId) {
  return request(`/order/reject?orderId=${orderId}&workerId=${workerId}`, 'PUT')
}

/**
 * 支付订单
 */
export function payOrder(orderId, amount) {
  return request(`/order/pay?orderId=${orderId}&amount=${amount}`, 'POST')
}
