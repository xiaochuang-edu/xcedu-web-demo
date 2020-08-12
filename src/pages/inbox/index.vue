<template>
  <section class="layout-list-content">
    <div class="layout-list-content-search padding-top-size-nomal padding-left-size-nomal padding-right-size-nomal">
      <el-row :gutter="6" type="flex" justify="space-between">
        <el-col :span="8">
          <el-input v-model="searchFrom.searchName" class="input-with-select" placeholder="主题、发件人" clearable>
            <!-- <el-button slot="suffix" icon="el-icon-search" @click="searchEmail" /> -->
            <template slot="append"><i class="el-icon-search" @click="searchEmail" /></template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAdvanceSearch">高级搜索</el-button>
        </el-col>
        <el-col :span="12" class="layout-list-content-search-btn-groups">
          <el-button v-if="viewType === 'deleteBox'" type="primary" @click="restoreEmail">还原</el-button>
          <!-- <el-button v-if="" type="default" @click="handleCommand('delComplete')">彻底删除</el-button> -->
          <el-button v-if="viewType === 'draftBox' || viewType === 'deleteBox'" type="default" @click="handleCommand('delComplete')">彻底删除</el-button>
          <el-dropdown v-if="viewType !== 'export' && viewType !== 'deleteBox' && viewType !== 'sendBox' && viewType !== 'draftBox'" split-button type="primary" placement="bottom" @command="handleCommand">
            <span @click="handleCommand('readed')">标记为已读</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="viewType !== 'unreadmail'" command="notRead">未读</el-dropdown-item>
              <el-dropdown-item command="allRead">全部已读</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown v-if="viewType !== 'deleteBox' && viewType !== 'draftBox'" split-button plain placement="bottom" @command="handleCommand">
            <span @click="handleCommand('batchDel')">批量删除</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="delComplete">彻底删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
      <el-form ref="form" :model="searchFrom" label-width="80px">
        <transition name="el-zoom-in-top">
          <el-row v-show="advanceSearchShow" class="padding-top-size-nomal advance-search-container margin-top-size-nomal">
            <el-col :span="10">
              <el-form-item label="起止时间">
                <el-date-picker
                  v-model="timeRange"
                  type="datetimerange"
                  :picker-options="pickerOptions"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <el-button type="primary" plain @click="searchEmail">搜索</el-button>
                <el-button plain @click="clearSearchValue">清空</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </transition>
      </el-form>
    </div>
    <el-table
      ref="emailTable"
      v-loading="loading"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.08)"
      :data="tbodyData"
      style="width: 100%;"
      :default-sort="{prop: 'sendName', asc: 'descending'}"
      @selection-change="rowSelectedChange"
      @sort-change="sortChange"
      @row-click="viewEmail"
    >
      <el-table-column type="selection" width="60" />
      <el-table-column
        v-for="(col, index) in tHeadData"
        :key="index"
        :prop="col.prop"
        :label="col.label"
        :sortable="col.sort ? true: false"
        :width="col.width"
      >
        <template slot-scope="scope">
          <i v-if="scope.column.property === 'status' && scope.row.status === 1 " class="icon-unread-mail color" />
          <i v-else-if="scope.column.property === 'status' && scope.row.status === 2 " class="icon-have-read" />
          <i v-else-if="scope.column.property === 'readIs' && scope.row.readIs === 0 " class="icon-unread-mail color" />
          <i v-else-if="scope.column.property === 'readIs' && scope.row.readIs === 1 " class="icon-have-read" />
          <div v-else-if="scope.column.property === 'oprate'" class="oprate-icon-groups">
            <i v-if="scope.row.status === 1" class="icon-undo" />
            <i class="icon-view" />
            <i class="icon-delete" style="cursor: pointer" @click.stop="deleteRow(scope.$index, tbodyData, scope.row.id)" />
          </div>
          <span v-else-if="scope.column.property === 'emergency'" :class=" scope.row[scope.column.property] === 1 ? 'red': ''">{{ scope.row[scope.column.property] === 1 ? '紧急':'普通' }}</span>
          <span v-else>{{ scope.row[scope.column.property] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :page-size="10"
      background
      layout="prev, pager, next, jumper, sizes, total"
      :total="total"
      class="tx-c margin-top-size-nomal padding-bottom-size-nomal"
      @current-change="searchEmail"
      @size-change="pageSizeChange"
    />
  </section>
</template>

<script>
import { getEmailList, deleteEmailById, completelyDeleteEmailById, handelReadOrStarByIds, deleteDraftBoxEmailById, getEmailListByStatus, restoreEmailById } from '@/api/index'
import unreadHeaderData from '@/json/unreadtable.json'
import draftHeaderData from '@/json/drafttable.json'
import sendBoxTableHead from '@/json/sendBox.json'
export default {
  data () {
    return {
      loading: false,
      advanceSearchShow: false,
      tHeadData: [],
      tbodyData: [],
      searchFrom: {
        startTime: '',
        endTime: '',
        searchName: ''
      },
      timeRange: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      checkedEmailArr: [],
      total: 0,
      page: 1,
      pageSize: 10,
      currentPage1: 1,
      order: '',
      asc: '',
      viewType: '' // 页面类型
    }
  },
  watch: {
    '$route.path': function () {
      this.advanceSearchShow = false
      this.clearSearchValue()
      this.getviewTypeReloadTable()
    },
    timeRange: function () {
      if (this.timeRange) {
        this.searchFrom.startTime = this.timeRange[0]
        this.searchFrom.endTime = this.timeRange[1]
      } else {
        this.searchFrom.startTime = ''
        this.searchFrom.endTime = ''
      }
    }
  },
  mounted: function () {
    this.checkedEmailArr = []
    this.getviewTypeReloadTable()
  },
  methods: {
    restoreEmail () {
      const req = {
        ids: this.arrayToStrWithOutComma(this.hasEmailChecked())
      }
      restoreEmailById(req).then(res => {
        if (res) {
          this.getEmailListByParams(this.searchFrom)
          this.$message({
            type: 'success',
            message: '还原成功'
          })
        }
      })
    },
    editEmailById (id) {
      this.$router.push({ name: 'compose', query: { id: id } })
    },
    getviewTypeReloadTable () {
      this.loading = true
      const viewType = this.$route.path.substring(this.$route.path.lastIndexOf('/') + 1)
      this.viewType = viewType
      if (viewType === 'draftBox') {
        this.tHeadData = draftHeaderData.thead
      } else if (viewType === 'sendBox') {
        this.tHeadData = sendBoxTableHead.thead
      } else {
        this.tHeadData = unreadHeaderData.thead
      }
      this.getEmailListByParams()
    },
    handleStar (index, row) {
      // 判断是否标星
      const req = {
        type: 'star',
        ids: row.id
      }
      if (row.starIs === 1) {
        req.status = 0
      } else {
        req.status = 1
      }

      handelReadOrStarByIds(req).then(res => {
        if (res) {
          if (row.starIs === 0) {
            this.$set(this.tbodyData[index], 'starIs', 1)
          } else {
            this.$set(this.tbodyData[index], 'starIs', 0)
          }
        }
      }).catch(err => {
        this.$message.error(err)
      })
    },
    clearSearchValue () {
      this.timeRange = []
      this.searchFrom.searchName = ''
      this.page = 1
      this.pageSize = 10
      this.$refs.emailTable.clearSelection()
    },
    handleCommand (command) {
      if (command === 'allRead') {
        // 全部标记为已读
        this.$confirm('确认全部标记为已读？', '', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const req = {
            type: 'read',
            status: 1,
            ids: this.arrayToStrWithOutComma(this.tbodyData, 'id')
          }
          handelReadOrStarByIds(req).then(res => {
            if (res) {
              for (const row of this.tbodyData) {
                this.$set(row, 'readIs', 1)
              }
              this.$message({
                message: '标记成功',
                type: 'success'
              })
            }
          })
        }).catch((err) => {
          this.$message.error(err)
        })
      } else if (command === 'readed' || command === 'notRead') {
        const status = command === 'notRead' ? 0 : 1
        const req = {
          type: 'read',
          status: status,
          ids: this.arrayToStrWithOutComma(this.hasEmailChecked())
        }
        handelReadOrStarByIds(req).then(res => {
          if (res) {
            for (const selectrow of this.checkedEmailArr) {
              for (const row of this.tbodyData) {
                if (selectrow.id === row.id) {
                  this.$set(row, 'readIs', status === 0 ? 0 : 1)
                }
              }
            }
            this.$message({
              message: '标记成功',
              type: 'success'
            })
          }
        }).catch(err => {
          this.$message.error(err)
        })
      } else if (command === 'batchDel') {
        const req = {
          ids: this.arrayToStrWithOutComma(this.hasEmailChecked())
        }
        deleteEmailById(3, req).then(res => {
          if (res) {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getEmailListByParams(this.searchFrom)
          }
        }).catch(err => {
          this.$message.error(err)
        })
      } else if (command === 'delComplete') {
        const req = {
          ids: this.arrayToStrWithOutComma(this.hasEmailChecked())
        }
        if (this.viewType === 'draftBox') {
          deleteDraftBoxEmailById(req).then(res => {
            if (res) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.getEmailListByParams(this.searchFrom)
            }
          }).catch(err => {
            this.$message.error(err)
          })
        } else {
          completelyDeleteEmailById(req).then(res => {
            if (res) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.getEmailListByParams(this.searchFrom)
            }
          }).then(err => {
            this.$message.error(err)
          })
        }
      }
    },
    hasEmailChecked () {
      const ids = []
      if (this.checkedEmailArr.length === 0) {
        this.$message({
          message: '请选择操作邮件',
          type: 'warning'
        })
        return false
      }
      for (const item of this.checkedEmailArr) {
        ids.push(item.id)
      }
      return ids
    },
    arrayToStrWithOutComma (arr, attr) {
      let str = ''
      if (attr) {
        for (const i of arr) {
          str += i[attr] + ','
        }
      } else {
        for (const i of arr) {
          str += i + ','
        }
      }
      return str.substring(0, str.lastIndexOf(','))
    },
    // 选中某行数据
    rowSelectedChange (selection) {
      // eslint-disable-next-line no-console
      this.checkedEmailArr = selection
    },
    // 排序
    sortChange (column) {
      // eslint-disable-next-line no-console
      this.order = column.prop
      this.asc = column.order === 'ascending' ? true : false
      this.getEmailListByParams(this.searchFrom)
    },
    searchEmail (page) {
      this.loading = true
      if (Number.isFinite(page)) {
        this.page = page
      }
      this.getEmailListByParams(this.searchFrom)
    },
    pageSizeChange (pageSize) {
      this.pageSize = pageSize
      this.loading = true
      this.getEmailListByParams(this.searchFrom)
    },
    showAdvanceSearch () {
      if (this.advanceSearchShow) {
        this.advanceSearchShow = false
      } else {
        this.advanceSearchShow = true
      }
    },
    getEmailListByParams (params) {
      const req = {
        page: this.page,
        pageSize: this.pageSize,
        order: this.order,
        asc: this.asc,
        ...params
      }
      // const type = this.viewType === 'draftBox' ? 'draftBox' : this.viewType === 'sendBox' ? 'sendBox' : 'commonBox'
      if (this.viewType === 'draftBox' || this.viewType === 'sendBox') {
        getEmailList(this.viewType, req).then(res => {
          this.loading = false
          this.tbodyData = res.records
          this.total = res.totalRecords
        }).catch(err => {
          this.loading = false
          this.$message.error(err)
        })
      } else {
        let urlParams
        if (this.viewType === 'receiveBox') {
          urlParams = {
            status: 2,
            ...req
          }
        } else if (this.viewType === 'starBox') {
          urlParams = {
            isStar: 1,
            ...req
          }
        } else if (this.viewType === 'unreadBox') {
          urlParams = {
            isRead: 0,
            status: 2,
            ...req
          }
        } else if (this.viewType === 'deleteBox') {
          urlParams = {
            status: 3,
            ...req
          }
        }
        getEmailListByStatus(urlParams).then(res => {
          this.tbodyData = res.records
          this.total = res.totalRecords
          this.loading = false
        }).catch(err => {
          this.loading = false
          this.$message.error(err)
        })
      }
    },
    deleteRow (index, rows, id) {
      this.$confirm('确认删除此条记录吗？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const req = {
          ids: id
        }
        if (this.viewType !== 'draftBox') {
          deleteEmailById(3, req).then(res => {
            if (res) {
              rows.splice(index, 1)
              this.$message({
                message: '删除成功',
                type: 'success'
              })
            }
            // 刷新列表
            this.getEmailListByParams()
          }).catch(err => {
            this.$message.error(err)
          })
        } else {
          deleteDraftBoxEmailById(req).then(res => {
            if (res) {
              rows.splice(index, 1)
              this.$message({
                message: '删除成功',
                type: 'success'
              })
            }
            // 刷新列表
            this.getEmailListByParams()
          }).catch(err => {
            this.$message.error(err)
          })
        }
      })
    },
    viewEmail (row, column) {
      if (column.label !== '操作') {
        // 如果当前页面为 收件箱 点击查看 设置为已阅读
        if (this.viewType === 'receiveBox') {
          const req = {
            type: 'read',
            status: 1,
            ids: row.mailId
          }
          handelReadOrStarByIds(req).then(res => {
            // 该邮件已阅读
          })
        }
        this.$router.push({ name: 'msgDetail', params: { id: row.mailId, viewType: this.viewType } })
      }
    }
  }
}
</script>
