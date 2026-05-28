import request from '@/utils/request'

export function fetchTypeList(params) {
  return request({
    url: '/dict/type/list',
    method: 'get',
    params
  })
}

export function getTypeDetail(id) {
  return request({
    url: `/dict/type/${id}`,
    method: 'get'
  })
}

export function createType(data) {
  return request({
    url: '/dict/type/create',
    method: 'post',
    data
  })
}

export function updateType(id, data) {
  return request({
    url: `/dict/type/update/${id}`,
    method: 'post',
    data
  })
}

export function updateTypeStatus(id, status) {
  return request({
    url: `/dict/type/updateStatus/${id}`,
    method: 'post',
    params: { status }
  })
}

export function deleteType(id) {
  return request({
    url: `/dict/type/delete/${id}`,
    method: 'post'
  })
}

export function fetchCategories() {
  return request({
    url: '/dict/type/categories',
    method: 'get'
  })
}