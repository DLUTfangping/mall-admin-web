import request from '@/utils/request'

export function fetchItemList(params) {
  return request({
    url: '/dict/item/list',
    method: 'get',
    params
  })
}

export function getItemDetail(id) {
  return request({
    url: `/dict/item/${id}`,
    method: 'get'
  })
}

export function createItem(data) {
  return request({
    url: '/dict/item/create',
    method: 'post',
    data
  })
}

export function updateItem(id, data) {
  return request({
    url: `/dict/item/update/${id}`,
    method: 'post',
    data
  })
}

export function updateItemStatus(id, status) {
  return request({
    url: `/dict/item/updateStatus/${id}`,
    method: 'post',
    params: { status }
  })
}

export function deleteItem(id) {
  return request({
    url: `/dict/item/delete/${id}`,
    method: 'post'
  })
}