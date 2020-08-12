<template>
  <section class="layout-list-content msg-details padding-nomal">
    <div class="btns-group">
      <el-button size="small" icon="el-icon-arrow-left" @click="toList" />
      <el-button type="primary" size="small">转发</el-button>
      <el-button size="small">再次发送</el-button>
    </div>
    <div v-if="email" class="mail-content">
      <h2 style="font-size: 26px;">{{ email.title }}</h2>
      <div class="mail-content-tips">
        <!-- <p>
          <span>{{ email.sendMailUser.simpleView }}</span>
          <span>于{{ email.sendMailDate }}发送给</span>
          <span >{{ email.receiveMailUser.simpleView }}</span>
        </p> -->
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
          <el-col :span="10">
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
        <!-- <cite>查看详情</cite> -->
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
      email: ''
    }
  },
  mounted () {
    const id = this.$route.params.id
    viewEmailById({ id: id }).then(res => {
      this.email = res
    })
  },
  methods: {
    toList () {
      this.$router.go(-1)
    }
  }
}
</script>
