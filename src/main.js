import { boot, setPublicPath } from '@xcedu/web-share'
import router from './router'
import store from './stores'
import '@style/common.scss'

import App from './App.vue'

setPublicPath('@xcedu/email')

const { bootstrap, mount, unmount } = boot(store, router, App)
export { bootstrap, mount, unmount }
