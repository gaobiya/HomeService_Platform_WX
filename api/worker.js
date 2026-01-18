import { request } from '../utils/request'

/**
 * 设置服务员服务类型
 */
export function setWorkerServiceTypes(workerId, serviceTypes) {
  return request('/worker/service-type/set', 'POST', {
    workerId,
    serviceTypes
  })
}

/**
 * 获取服务员服务类型列表
 */
export function getWorkerServiceTypes(workerId) {
  return request(`/worker/service-type/${workerId}`, 'GET')
}

/**
 * 删除服务员服务类型
 */
export function removeWorkerServiceType(workerId, serviceType) {
  return request(`/worker/service-type/${workerId}/${serviceType}`, 'DELETE')
}
