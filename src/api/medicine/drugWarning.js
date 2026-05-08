import request from '@/utils/request'

export function getDrugWarning(drugCode) {
  return request({
    url: '/drugWarning/' + drugCode,
    method: 'get'
  })
}

export function saveDrugWarning(data) {
  return request({
    url: '/drugWarning/save',
    method: 'post',
    data: data
  })
}
