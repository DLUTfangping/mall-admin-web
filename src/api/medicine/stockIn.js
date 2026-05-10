import request from '@/utils/request'

export function fetchStockInList(params) {
  return request({
    url: '/stockIn/list',
    method: 'get',
    params
  })
}

export function getStockInDetail(id) {
  return request({
    url: `/stockIn/${id}`,
    method: 'get'
  })
}

export function createStockIn(data) {
  return request({
    url: '/stockIn/create',
    method: 'post',
    data
  })
}

export function updateStockIn(id, data) {
  return request({
    url: `/stockIn/update/${id}`,
    method: 'post',
    data
  })
}

export function deleteStockIn(id) {
  return request({
    url: `/stockIn/delete/${id}`,
    method: 'post'
  })
}

export function confirmStockIn(id) {
  return request({
    url: `/stockIn/confirm/${id}`,
    method: 'post'
  })
}

export function searchDrugs(keyword) {
  return request({
    url: '/stockIn/searchDrugs',
    method: 'get',
    params: { keyword }
  })
}
