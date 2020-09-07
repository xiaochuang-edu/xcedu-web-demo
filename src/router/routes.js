import MsgList from '@page/inbox/index.vue'
import Layout from '@page/layout.vue'
import Compose from '@page/compose.vue'
import msgDetail from '@page/inbox/inboxDetail.vue'
const emailLayout = {
  path: '/mfs-demo',
  redirect: '/mfs-demo/msgList/receiving',
  component: Layout,
  children: [{
    name: 'msgLlist',
    path: 'msgList/:viewname',
    component: MsgList
  }, {
    name: 'compose',
    path: 'compose',
    component: Compose
  }, {
    name: 'msgDetail',
    path: 'detail/:viewType/:id',
    component: msgDetail
  }]
}

export default [emailLayout]
