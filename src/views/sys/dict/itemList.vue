<template>
  <div class="dict-item-container">
    <div class="page-header">
      <span class="title">字典项管理</span>
      <span class="sub-title">当前字典：{{ dictName }}（ {{ dictCode }} ）</span>
    </div>

    <div class="filter-container">
      <el-input v-model="listQuery.itemName" placeholder="项名称" style="width: 150px;" clearable />
      <el-input v-model="listQuery.itemCode" placeholder="项编码" style="width: 150px;" clearable />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 100px">
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      <el-button type="text" icon="el-icon-arrow-left" @click="goBack">返回字典类型</el-button>
    </div>

    <div class="table-toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加字典项</el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border stripe style="width: 100%">
      <el-table-column label="项编码" prop="itemCode" width="150" align="center" />
      <el-table-column label="项名称" prop="itemName" width="150" align="center" />
      <el-table-column label="排序" prop="itemSort" width="80" align="center" />
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">{{ scope.row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column label="创建时间" width="150" align="center">
        <template slot-scope="scope">{{ formatDate(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" style="color: #F56C6C" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="listQuery.pageSize"
      :current-page="listQuery.pageNum"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      style="margin-top: 20px; text-align: right;"
    />

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="dialogForm" :model="dialogData" :rules="dialogRules" label-width="100px">
        <el-form-item label="项编码" prop="itemCode">
          <el-input v-model="dialogData.itemCode" placeholder="如：MALE, FEMALE" :disabled="dialogType === 'update'" />
        </el-form-item>
        <el-form-item label="项名称" prop="itemName">
          <el-input v-model="dialogData.itemName" placeholder="如：男" />
        </el-form-item>
        <el-form-item label="排序" prop="itemSort">
          <el-input-number v-model="dialogData.itemSort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dialogData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dialogData.remark" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchItemList, createItem, updateItem, deleteItem } from '@/api/sys/dictItem'
import { formatDate } from '@/utils/date'

export default {
  name: 'DictItemList',
  data() {
    return {
      dictCode: '',
      dictName: '',
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        itemName: '',
        itemCode: '',
        status: '',
        dictCode: '',
        pageNum: 1,
        pageSize: 10
      },
      dialogVisible: false,
      dialogType: 'create',
      dialogTitle: '',
      dialogData: {
        id: null,
        dictCode: '',
        itemCode: '',
        itemName: '',
        itemSort: 0,
        status: 1,
        remark: ''
      },
      dialogRules: {
        itemCode: [{ required: true, message: '请输入项编码', trigger: 'blur' }],
        itemName: [{ required: true, message: '请输入项名称', trigger: 'blur' }]
      },
      submitLoading: false
    }
  },
  created() {
    this.dictCode = this.$route.query.dictCode || ''
    this.dictName = this.$route.query.dictName || ''
    this.listQuery.dictCode = this.dictCode
    this.loadList()
  },
  methods: {
    loadList() {
      this.listLoading = true
      fetchItemList(this.listQuery).then(res => {
        this.list = res.data.list || []
        this.total = res.data.total || 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleSearch() {
      this.listQuery.pageNum = 1
      this.loadList()
    },
    handleReset() {
      this.listQuery = {
        ...this.listQuery,
        itemName: '',
        itemCode: '',
        status: ''
      }
      this.listQuery.pageNum = 1
      this.loadList()
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.listQuery.pageNum = 1
      this.loadList()
    },
    handlePageChange(val) {
      this.listQuery.pageNum = val
      this.loadList()
    },
    handleCreate() {
      this.dialogType = 'create'
      this.dialogTitle = '添加字典项'
      this.dialogData = { id: null, dictCode: this.dictCode, itemCode: '', itemName: '', itemSort: 0, status: 1, remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogType = 'update'
      this.dialogTitle = '编辑字典项'
      this.dialogData = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该字典项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteItem(row.id).then(() => {
          this.$message.success('删除成功')
          this.loadList()
        })
      })
    },
    handleSubmit() {
      this.$refs.dialogForm.validate(valid => {
        if (!valid) return
        this.submitLoading = true
        const promise = this.dialogType === 'create'
          ? createItem(this.dialogData)
          : updateItem(this.dialogData.id, this.dialogData)
        promise.then(() => {
          this.$message.success(this.dialogType === 'create' ? '添加成功' : '更新成功')
          this.dialogVisible = false
          this.loadList()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    goBack() {
      this.$router.push({ name: 'DictTypeList' })
    },
    formatDate(val) {
      return formatDate(val)
    }
  }
}
</script>

<style scoped>
.dict-item-container {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.page-header .title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 15px;
}
.page-header .sub-title {
  color: #909399;
  font-size: 13px;
}
.filter-container {
  margin-bottom: 15px;
}
.filter-container .el-input,
.filter-container .el-select {
  margin-right: 10px;
}
.table-toolbar {
  margin-bottom: 15px;
}
</style>