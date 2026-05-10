import request from '@/utils/request'

export function fetchPharmacyList(params) {
  return request({
    url: '/pharmacy/list',
    method: 'get',
    params
  })
}

export function getPharmacy(id) {
  return request({
    url: `/pharmacy/${id}`,
    method: 'get'
  })
}

export function createPharmacy(data) {
  return request({
    url: '/pharmacy/create',
    method: 'post',
    data
  })
}

export function updatePharmacy(id, data) {
  return request({
    url: `/pharmacy/update/${id}`,
    method: 'post',
    data
  })
}

export function deletePharmacy(id) {
  return request({
    url: `/pharmacy/delete/${id}`,
    method: 'post'
  })
}

export function updatePharmacyStatus(id, status) {
  return request({
    url: `/pharmacy/updateStatus/${id}`,
    method: 'post',
    params: { status }
  })
}

export function setDefaultPharmacy(id) {
  return request({
    url: `/pharmacy/setDefault/${id}`,
    method: 'post'
  })
}
