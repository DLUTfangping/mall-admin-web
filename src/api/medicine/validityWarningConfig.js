import request from '@/utils/request'

export function getValidityWarningConfigList() {
  return request({
    url: '/validityWarning/config/list',
    method: 'get'
  })
}

export function getEnabledValidityWarningConfig() {
  return request({
    url: '/validityWarning/config/enabled',
    method: 'get'
  })
}

export function saveValidityWarningConfig(data) {
  return request({
    url: '/validityWarning/config/save',
    method: 'post',
    data: data
  })
}