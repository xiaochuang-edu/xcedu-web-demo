<template>
  <section class="layout-list-content padding-top-size-nomal padding-bottom-size-nomal">
    <el-form
      ref="composeForm"
      :rules="rules"
      :model="form"
      label-width="100px"
      style="width: 1000px; margin: 0 auto"
    >
      <div style="display: flex; justify-content: flex-end">
        <el-button type="text" @click="showCopy"><em v-if="!isCopy">显示抄送</em><em v-else>删除抄送</em></el-button>
        <el-button type="text" @click="showSecret"><em v-if="!isSecrte">显示密送</em><em v-else>删除密送</em></el-button>
      </div>
      <el-form-item label="收件人" prop="recipientSend">
        <el-row>
          <el-col :span="24">
            <!-- <chooseUser ref="recipient" v-model="form.recipientSend" :allow-write="true" :select-role="roles" /> -->
            <chooseUser
              ref="recipientSend"
              v-model="form.recipientSend"
              :allow-write="true"
              :select-role="roles"
              :get-user="getUser"
              :get-search-list="getSearchList"
            />
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-if="isCopy" label="抄送人" prop="copySend">
        <el-row>
          <el-col :span="24">
            <chooseUser
              ref="copySend"
              v-model="form.copySend"
              :allow-write="true"
              :select-role="roles"
              :get-user="getUser"
              :get-search-list="getSearchList"
            />
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-if="isSecrte" label="密送人" prop="secretSend">
        <el-row>
          <el-col :span="24">
            <chooseUser
              ref="secretSend"
              v-model="form.secretSend"
              :allow-write="true"
              :select-role="roles"
              :get-user="getUser"
              :get-search-list="getSearchList"
            />
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="主题" prop="title">
        <el-input v-model="form.title" placeholder="不超过20个字符" maxlength="20" show-word-limit />
      </el-form-item>
      <el-form-item label="附件上传">
        <FileUp
          v-model="form.imgFileIds"
          upload-type="image"
          :domain-id="domainId"
          dir="demo"
          style="padding-top:5px"
        />
      </el-form-item>
      <el-form-item v-if="!form.contentType" label="">
        <Editor ref="emailContent" v-model="form.htmlContent" />
      </el-form-item>
      <el-form-item v-if="form.contentType" label="">
        <el-input v-model="form.htmlContent" type="textarea" :rows="22" />
      </el-form-item>
      <el-form-item label="高级选项">
        <el-checkbox v-model="form.emergency" value="1">紧急</el-checkbox>
        <el-checkbox v-model="form.backIs" value="1">回执</el-checkbox>
        <el-checkbox v-model="form.contentType" value="1">纯文本</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('normal','composeForm')">发送</el-button>
        <el-button @click="submitForm('draft','composeForm')">保存草稿</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
<script>
import { createEmail, updateEmailById, getEmailById, getChooseUserDataByParams, getSearchListByValue } from '@/api/index'
export default {
  data () {
    return {
      form: {
        recipientSend: [],
        copySend: [],
        secretSend: [],
        title: '',
        htmlContent: '',
        emergency: 0, // 是否紧急
        backIs: 0, // 是否回执
        contentType: 0, // 是否纯文本，
        imgFileIds: ''
      },
      domainId: '',
      isCopy: 0,
      isSecrte: 0,
      roles: ['orgUser'],
      rules: {
        title: [
          { required: true, message: '请输入主题', trigger: 'focus' }
        ]
      },
      viewType: ''
    }
  },
  watch: {
    $route: function () {
      if (!this.$route.query.id) {
        this.form = {
          recipientSend: [],
          copySend: [],
          secretSend: [],
          title: '',
          htmlContent: '',
          emergency: 0, // 是否紧急
          backIs: 0, // 是否回执
          contentType: 0 // 是否纯文本
        }
      }
    }
  },
  mounted: function () {
    const id = this.$route.query.id

    if (id) {
      const req = {
        id: id
      }
      // 修改
      getEmailById(req).then(res => {
        this.form = res
        if (res.backIs === 1) {
          this.form.backIs = true
        }
        if (res.emergency === 1) {
          this.form.emergency = true
        }
      })
    }
  },
  methods: {
    getUser: getChooseUserDataByParams, // 获取ztree 数据 ， api 的方法名可自定义， getUser 为固定方法
    getSearchList: getSearchListByValue, // 获取联想搜索 数据， 同上。
    showCopy () {
      // 是否显示抄送 或者 删除
      if (this.isCopy) {
        this.isCopy = 0
      } else {
        this.isCopy = 1
      }
    },
    showSecret () {
      // 是否显示密送 或者 删除
      if (this.isSecrte) {
        this.isSecrte = 0
      } else {
        this.isSecrte = 1
      }
    },
    submitForm (saveType, formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.form.backIs = this.form.backIs ? 1 : 0
          this.form.emergency = this.form.emergency ? 1 : 0
          this.form.contentType = this.form.contentType ? 1 : 0
          if (this.$route.query.id) {
            this.form.id = this.$route.query.id
            updateEmailById(saveType, this.form).then(res => {
              if (res) {
                this.$message({
                  message: '修改成功',
                  type: 'success'
                })
                this.$router.push({ name: 'msgLlist', params: { viewname: 'sendBox' } })
              } else {
                this.$message(res)
              }
            })
          } else {
            createEmail(saveType, this.form).then(res => {
              // console.log(res)
              if (res) {
                this.$message({
                  message: '发送成功',
                  type: 'success'
                })
                this.$router.push({ name: 'msgLlist', params: { viewname: 'sendBox' } })
              }
            }).catch(err => {
              this.$message.error(err)
            })
          }
        } else {
          // console.log('error submit!!')
          return false
        }
      })
    },
    resetForm () {
      // console.log('submit!')
    }
  }
}
</script>
