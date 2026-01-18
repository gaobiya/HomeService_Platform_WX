import { request } from '../utils/request'

/**
 * 添加可服务时间段
 */
export function addSchedule(workerId, startTime, endTime) {
  return request('/schedule/add', 'POST', {
    workerId,
    startTime,
    endTime
  })
}

/**
 * 删除日程
 */
export function deleteSchedule(scheduleId, workerId) {
  return request(`/schedule/${scheduleId}?workerId=${workerId}`, 'DELETE')
}

/**
 * 获取服务员的日程列表
 */
export function getWorkerSchedules(workerId) {
  return request(`/schedule/worker/${workerId}`, 'GET')
}

/**
 * 获取服务员已安排的订单
 */
export function getWorkerScheduledOrders(workerId) {
  return request(`/schedule/worker/${workerId}/orders`, 'GET')
}
