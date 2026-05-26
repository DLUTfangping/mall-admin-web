import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/drug/list',
    method: 'get',
    params: params
  })
}

export function getDrug(id) {
  return request({
    url: '/drug/' + id,
    method: 'get'
  })
}

export function createDrug(data) {
  return request({
    url: '/drug/create',
    method: 'post',
    data: data
  })
}

export function updateDrug(id, data) {
  return request({
    url: '/drug/update/' + id,
    method: 'post',
    data: data
  })
}

export function deleteDrug(id) {
  return request({
    url: '/drug/delete/' + id,
    method: 'post'
  })
}

export function updateDrugStatus(id, status) {
  return request({
    url: '/drug/updateStatus/' + id,
    method: 'post',
    params: { status: status }
  })
}

export function searchDrugs(keyword) {
  return request({
    url: '/drug/searchDrugs',
    method: 'get',
    params: keyword ? { keyword } : {}
  })
}
