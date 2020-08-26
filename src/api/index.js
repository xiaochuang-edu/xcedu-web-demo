import { axios } from 'xc-share'

// 修改提交数据
export function updateEmailById (form) {
  return axios.put('/api-base/demos', form)
}
// 查看邮件
export function getEmailById (params) {
  return axios.get('/api-base/demos/one', { params: params })
}
// 新建保存
export function createEmail (form) {
  return axios.post('/api-base/demos', form)
}
// 删除邮件
export function deleteEmailById (params) {
  return axios.delete('/api-base/demos', { params })
}
// 获取demo列表
export function getEmailListByStatus (params) {
  return axios.get('/api-base/demos/pageList', { params })
}
// 查看邮件
export function viewEmailById (params) {
  return axios.get('/api-base/mails/viewMail', { params })
}

// 选人接口
export function getChooseUserDataByParams (params) {
  return axios.get('/api-base/rangeScopes', { params })
}
// 选人输入
export function getSearchListByValue (params) {
  return axios.get('/api-base/rangeScopes?type=search', { params })
}
