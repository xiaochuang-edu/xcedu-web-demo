<template>
  <section class="layout-list-content msg-details padding-nomal">
    <div class="btns-group">
      <el-button icon="el-icon-arrow-left" @click="toList" />
      <el-button type="primary">转发</el-button>
      <el-button>再次发送</el-button>
    </div>
    <div v-if="email" class="mail-content">
      <h2 class="size-large-x">{{ email.title }}</h2>
      <div class="mail-content-tips" style="position: relative">
        <el-row>
          <el-col :span="1">
            <label>发件人</label>
          </el-col>
          <el-col :span="10">
            {{ email.sendMailUser.simpleView }}
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="1">
            <label>收件人</label>
          </el-col>
          <el-col :span="23">
            <span v-for="(user,index) in email.receiveMailUser" :key="index">{{ user.simpleView }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="1">
            <label>时&nbsp;&nbsp;&nbsp;间</label>
          </el-col>
          <el-col :span="10">
            {{ email.sendMailDate }}
          </el-col>
        </el-row>
        <span v-if="email.imgFileIds" style="position: absolute; right: 20px; top: 10px; cursor: pointer " class="color" @click="showDetails">精简信息</span>
        <div v-if="showDetail">
          <FileUp :value="email.imgFileIds.join(',')" upload-type="image" readonly />
        </div>
      </div>
      <el-divider />
      <div class="mail-content-html" v-html="email.mailContent" />
    </div>
  </section>
</template>
<script>
import { viewEmailById } from '@/api/index'
export default {
  data () {
    return {
      email: '',
      showDetail: false
    }
  },
  mounted () {
    const id = this.$route.params.id
    viewEmailById({ id: id }).then(res => {
      this.email = res
    })
  },
  methods: {
    showDetails () {
      if (this.showDetail) {
        this.showDetail = false
      } else {
        this.showDetail = true
      }
    },
    toList () {
      this.$router.go(-1)
    }
  }
}
</script>
