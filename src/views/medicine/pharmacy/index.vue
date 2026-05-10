<template>
  <div class="medicine-pharmacy">
    <div class="content-header">
      <h3 class="content-title">药房管理</h3>
    </div>
    <div class="filter-container">
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="禁用" :value="0" />
        <el-option label="启用" :value="1" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="药房名称/创建人" style="width: 200px;" clearable/>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加药房</el-button>
    </div>

    <!-- 列表 -->
    <el-table v-loading="listLoading" :data="list" border stripe style="width: 100%">
      <el-table-column label="ID" prop="id" width="80" align="center" />
      <el-table-column label="药房名称" prop="pharmacyName" align="center" />
      <el-table-column label="创建人" prop="creator" width="120" align="center" />
      <el-table-column label="默认药房" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isDefault === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.isDefault === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip />
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            v-if="scope.row.isDefault !== 1"
            size="mini"
            type="text"
            @click="handleSetDefault(scope.row)"
          >设为默认</el-button>
          <el-button size="mini" type="text" style="color: #F56C6C" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="handlePageChange"
    />

    <!-- 创建/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="500px">
      <el-form ref="pharmacyForm" :model="pharmacyForm" :rules="rules" label-width="100px" size="small">
        <el-form-item label="药房名称" prop="pharmacyName">
          <el-input v-model="pharmacyForm.pharmacyName" />
        </el-form-item>
        <el-form-item label="是否默认">
          <el-switch v-model="pharmacyForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="pharmacyForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog title="药房详情" :visible.sync="viewDialogVisible" width="500px">
      <el-form label-width="100px" size="small">
        <el-form-item label="药房名称">
          <span>{{ pharmacyForm.pharmacyName }}</span>
        </el-form-item>
        <el-form-item label="创建人">
          <span>{{ pharmacyForm.creator }}</span>
        </el-form-item>
        <el-form-item label="默认药房">
          <el-tag :type="pharmacyForm.isDefault === 1 ? 'success' : 'info'" size="small">
            {{ pharmacyForm.isDefault === 1 ? '是' : '否' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="pharmacyForm.status === 1 ? 'success' : 'info'" size="small">
            {{ pharmacyForm.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ formatDate(pharmacyForm.createTime) }}</span>
        </el-form-item>
        <el-form-item label="备注">
          <span>{{ pharmacyForm.remark || '-' }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchPharmacyList, getPharmacy, createPharmacy, updatePharmacy, deletePharmacy, updatePharmacyStatus, setDefaultPharmacy } from '@/api/medicine/pharmacy'

export default {
  name: 'MedicinePharmacy',
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        status: null,
        keyword: ''
      },
      dialogFormVisible: false,
      viewDialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      pharmacyForm: {
        id: null,
        pharmacyName: '',
        creator: '',
        status: 1,
        remark: '',
        isDefault: 0
      },
      rules: {
        pharmacyName: [{ required: true, message: '请输入药房名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchPharmacyList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSearch() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handlePageChange(page) {
      this.listQuery.pageNum = page
      this.getList()
    },
    handleAdd() {
      this.resetForm()
      this.dialogTitle = '添加药房'
      this.isEdit = false
      this.dialogFormVisible = true
    },
    handleEdit(row) {
      getPharmacy(row.id).then(response => {
        this.pharmacyForm = { ...response.data }
        this.dialogTitle = '编辑药房'
        this.isEdit = true
        this.dialogFormVisible = true
      })
    },
    handleView(row) {
      getPharmacy(row.id).then(response => {
        this.pharmacyForm = { ...response.data }
        this.viewDialogVisible = true
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该药房吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePharmacy(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    },
    handleStatusChange(row) {
      updatePharmacyStatus(row.id, row.status).then(() => {
        this.$message.success('状态修改成功')
      }).catch(() => {
        row.status = row.status === 1 ? 0 : 1
      })
    },
    handleSetDefault(row) {
      this.$confirm('确定要将该药房设为默认药房吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setDefaultPharmacy(row.id).then(() => {
          this.$message.success('设置成功')
          this.getList()
        })
      })
    },
    submitForm() {
      this.$refs.pharmacyForm.validate(valid => {
        if (valid) {
          // 新增时自动设置创建人为当前登录用户
          if (!this.isEdit) {
            this.pharmacyForm.creator = this.$store.state.user.name || 'admin'
          }
          if (this.isEdit) {
            updatePharmacy(this.pharmacyForm.id, this.pharmacyForm).then(() => {
              this.$message.success('更新成功')
              this.dialogFormVisible = false
              this.getList()
            })
          } else {
            createPharmacy(this.pharmacyForm).then(() => {
              this.$message.success('创建成功')
              this.dialogFormVisible = false
              this.getList()
            })
          }
        }
      })
    },
    resetForm() {
      this.pharmacyForm = {
        id: null,
        pharmacyName: '',
        creator: '',
        status: 1,
        remark: '',
        isDefault: 0
      }
    },
    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.medicine-pharmacy {
  padding: 20px;
}
.content-header {
  margin-bottom: 20px;
}
.content-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
