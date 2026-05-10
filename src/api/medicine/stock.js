import request from '@/utils/request'

export function fetchStockList(params) {
  return request({
    url: '/stock/list',
    method: 'get',
    params
  })
}

export function getStockDetail(id) {
  return request({
    url: `/stock/${id}`,
    method: 'get'
  })
}

export function getStockByDrug(drugId) {
  return request({
    url: `/stock/byDrug/${drugId}`,
    method: 'get'
  })
}