<template>
  <section class="layout-list-content">
    <div class="layout-list-content-search padding-top-size-nomal padding-left-size-nomal padding-right-size-nomal">
      <el-row :gutter="6" type="flex" justify="space-between">
        <el-col :span="8">
          <el-input v-model="searchFrom.searchName" class="input-with-select" placeholder="主题、发件人" clearable>
            <template slot="append"><i class="el-icon-search" @click="searchEmail" /></template>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="showAdvanceSearch">高级搜索</el-button>
        </el-col>
      </el-row>
      <el-form ref="form" :model="searchFrom" label-width="80px">
        <transition name="el-zoom-in-top">
          <el-row v-show="advanceSearchShow" class="padding-top-size-nomal padding-left-size-nomal padding-right-size-nomal advance-search-container margin-top-size-nomal ">
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
          <i v-if="scope.column.property === 'oprate'" class="el-icon-edit" @click="editEmailById(scope.row.id)" />
          <i v-if="scope.column.property === 'oprate'" class="icon-delete" style="cursor: pointer" @click.stop="deleteRow(scope.$index, tbodyData, scope.row.id)" />
          <span v-if="scope.column.property === 'emergency'" :class=" scope.row[scope.column.property] === 1 ? 'red': ''">{{ scope.row[scope.column.property] === 1 ? '紧急':'普通' }}</span>
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
import { deleteEmailById, handelReadOrStarByIds, getEmailListByStatus } from '@/api/index'
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
    editEmailById (id) {
      this.$router.push({ name: 'compose', query: { id: id } })
    },
    getviewTypeReloadTable () {
      this.loading = true
      const viewType = this.$route.path.substring(this.$route.path.lastIndexOf('/') + 1)
      this.viewType = viewType
      this.tHeadData = sendBoxTableHead.thead
      this.getEmailListByParams()
    },
    clearSearchValue () {
      this.timeRange = []
      this.searchFrom.searchName = ''
      this.page = 1
      this.pageSize = 10
      this.$refs.emailTable.clearSelection()
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
      getEmailListByStatus(req).then(res => {
        this.tbodyData = res.records
        this.total = res.totalRecords
        this.loading = false
      }).catch(err => {
        this.loading = false
        this.$message.error(err)
      })
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
        deleteEmailById(req).then(res => {
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
