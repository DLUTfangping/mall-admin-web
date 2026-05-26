import request from '@/utils/request'

export function fetchStockOutList(params) {
  return request({
    url: '/stockOut/list',
    method: 'get',
    params
  })
}

export function getStockOutDetail(id) {
  return request({
    url: `/stockOut/${id}`,
    method: 'get'
  })
}

export function createStockOut(data) {
  return request({
    url: '/stockOut/create',
    method: 'post',
    data
  })
}

export function updateStockOut(id, data) {
  return request({
    url: `/stockOut/update/${id}`,
    method: 'post',
    data
  })
}

export function deleteStockOut(id) {
  return request({
    url: `/stockOut/delete/${id}`,
    method: 'post'
  })
}

export function getStockByPharmacy(pharmacyId) {
  return request({
    url: '/stockOut/getStockByPharmacy',
    method: 'get',
    params: { pharmacyId }
  })
}