<template>
  <section class="app-nav-bar">
    <div class="app-nav-bar-title bordercolor margin-bottom-size-mix">
      <div class="bgcolor">
        <i class="icon-email" />
      </div>
      <p class="size-large">邮件</p>
    </div>
    <div class="app-nav-bar-btn">
      <el-button type="primary" @click="compose"><i class="icon-plus-o el-icon--left" />新建</el-button>
    </div>
    <el-menu class="el-menu-vertical-demo" router default-active="/mfs-demo/msgList/sendBox">
      <el-menu-item v-for="(nav, index) in navList" :key="index" :index="`/mfs-demo/msgList/${nav.viewName}`">
        <i :class="nav.icon" :style="{ color: nav.color }" />
        <span slot="title">{{ nav.name }}</span>
      </el-menu-item>
    </el-menu>
  </section>
</template>
<script>
export default {
  name: 'EmailNavbar',
  data: () => {
    return {
      viewName: 'sendBox',
      navList: [{
        icon: 'icon-export',
        name: '发件箱',
        color: 'rgb(226,225,97)',
        id: '40289e8b6c2177df016c22b354ef000c',
        viewName: 'sendBox'
      }, {
        icon: 'icon-delete',
        name: '废件箱',
        color: 'rgb(255,0,0)',
        id: '40289e8b6c2177df016c22b354ef0001',
        viewName: 'deleteBox'
      }]
    }
  },
  mounted: function () {
    this.viewName = this.$route.path.substring(this.$route.path.lastIndexOf('/') + 1)
  },
  methods: {
    compose () {
      this.$router.push('/mfs-demo/compose')
    },
    viewMsgList (name) {
      // this.$router.push('/email/')
      this.$router.push({ name: 'msgLlist', params: { viewname: name } })
    }
  }
}
</script>
