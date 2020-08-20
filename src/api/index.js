import { axios } from 'xc-share'

// 修改提交数据
export function updateEmailById (saveType, form) {
  return axios.post('/api-base/mails?saveType=' + saveType, form)
}
// 查看邮件
export function getEmailById (params) {
  return axios.get('/api-base/mails/getMail', { params: params })
}
// 查询列表
export function getEmailList (viewType, params) {
  return axios.get('/api-base/innerMails/' + viewType, { params })
}
// 查询列表 收件箱 废件箱 星标邮件
export function getEmailListByStatus (params) {
  return axios.get('/api-base/innerMails/commonMailBox', { params: params })
}
// 新建保存
export function createEmail (saveType, form) {
  return axios.post('/api-base/innerMails?saveType=' + saveType, form)
}
// 彻底删除
export function completelyDeleteEmailById (params) {
  return axios.delete('/api-base/innerMails/mailUsers', { params: params })
}
// 删除邮件
export function deleteEmailById (status, params) {
  return axios.put('/api-base/innerMails/mailStatus/' + status, null, { params: params })
}
// 删除草稿箱邮件
export function deleteDraftBoxEmailById (params) {
  return axios.delete('/api-base/mails/draftMails', { params: params })
}
// 设置邮件已读未读标星取消标星
export function handelReadOrStarByIds (params) {
  return axios.put('/api-base/mails/makeUserMail', null, { params: params })
}

// 查看邮件
export function viewEmailById (params) {
  return axios.get('/api-base/mails/viewMail', { params })
}
// 还原
export function restoreEmailById (params) {
  return axios.put('/api-base/mails/restoreUserMails', null, { params: params })
}

// 选人接口
export function getChooseUserDataByParams (params) {
  return axios.get('/api-base/rangeScopes', { params })
}
// 选人输入
export function getSearchListByValue (params) {
  return axios.get('/api-base/rangeScopes?type=search', { params })
}
