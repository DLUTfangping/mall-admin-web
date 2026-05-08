import request from '@/utils/request'

export function getDrugUsageList(drugCode) {
  return request({
    url: '/drugUsage/list/' + drugCode,
    method: 'get'
  })
}

export function createDrugUsage(data) {
  return request({
    url: '/drugUsage/create',
    method: 'post',
    data: data
  })
}

export function updateDrugUsage(id, data) {
  return request({
    url: '/drugUsage/update/' + id,
    method: 'post',
    data: data
  })
}

export function deleteDrugUsage(id) {
  return request({
    url: '/drugUsage/delete/' + id,
    method: 'post'
  })
}
