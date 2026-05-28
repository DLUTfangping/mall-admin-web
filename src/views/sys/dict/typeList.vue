<template>
  <div class="dict-type-container">
    <div class="filter-container">
      <el-input v-model="listQuery.dictName" placeholder="字典名称" style="width: 150px;" clearable />
      <el-input v-model="listQuery.dictCode" placeholder="字典编码" style="width: 150px;" clearable />
      <el-select v-model="listQuery.category" placeholder="业务分类" clearable style="width: 150px">
        <el-option v-for="c in categoryList" :key="c" :label="c" :value="c" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 100px">
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
    </div>

    <div class="table-toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加字典类型</el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border stripe style="width: 100%">
      <el-table-column label="字典编码" prop="dictCode" width="150" align="center" />
      <el-table-column label="字典名称" prop="dictName" width="150" align="center" />
      <el-table-column label="业务分类" prop="category" width="120" align="center" />
      <el-table-column label="描述" prop="description" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-switch
            :active-value="1"
            :inactive-value="0"
            :value="scope.row.status"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" width="80" align="center" />
      <el-table-column label="创建时间" width="150" align="center">
        <template slot-scope="scope">{{ formatDate(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleItems(scope.row)">字典项</el-button>
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

    <!-- 字典类型编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="dialogForm" :model="dialogData" :rules="dialogRules" label-width="100px">
        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="dialogData.dictCode" placeholder="如：SEX, DRUG_TYPE" :disabled="dialogType === 'update'" />
        </el-form-item>
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="dialogData.dictName" placeholder="如：性别字典" />
        </el-form-item>
        <el-form-item label="业务分类" prop="category">
          <el-input v-model="dialogData.category" placeholder="如：基础数据、药材业务" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogData.description" type="textarea" :rows="2" placeholder="字典描述信息" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dialogData.sort" :min="0" :max="9999" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 字典项弹窗 -->
    <el-dialog :title="'字典项 - ' + itemDialogTitle" :visible.sync="itemDialogVisible" width="900px" :close-on-click-modal="false">
      <div class="item-toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleItemCreate">添加字典项</el-button>
      </div>
      <el-table v-loading="itemLoading" :data="itemList" border stripe size="small">
        <el-table-column label="项编码" prop="itemCode" width="150" align="center" />
        <el-table-column label="项名称" prop="itemName" width="150" align="center" />
        <el-table-column label="排序" prop="itemSort" width="80" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini">{{ scope.row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              :value="scope.row.status"
              @change="handleItemStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleItemEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #F56C6C" @click="handleItemDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 字典项编辑弹窗 -->
    <el-dialog :title="itemDialogType === 'create' ? '添加字典项' : '编辑字典项'" :visible.sync="itemFormVisible" width="450px" :close-on-click-modal="false">
      <el-form ref="itemFormRef" :model="itemFormData" :rules="itemFormRules" label-width="80px">
        <el-form-item label="项编码" prop="itemCode">
          <el-input v-model="itemFormData.itemCode" placeholder="如：MALE" :disabled="itemDialogType === 'update'" />
        </el-form-item>
        <el-form-item label="项名称" prop="itemName">
          <el-input v-model="itemFormData.itemName" placeholder="如：男" />
        </el-form-item>
        <el-form-item label="排序" prop="itemSort">
          <el-input-number v-model="itemFormData.itemSort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="itemFormData.remark" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="itemFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleItemSubmit" :loading="itemSubmitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchTypeList, createType, updateType, updateTypeStatus, deleteType, fetchCategories } from '@/api/sys/dictType'
import { fetchItemList, createItem, updateItem, updateItemStatus, deleteItem } from '@/api/sys/dictItem'

export default {
  name: 'DictTypeList',
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        dictName: '',
        dictCode: '',
        category: '',
        status: '',
        pageNum: 1,
        pageSize: 10
      },
      categoryList: [],
      dialogVisible: false,
      dialogType: 'create',
      dialogTitle: '',
      dialogData: {
        id: null,
        dictCode: '',
        dictName: '',
        category: '',
        description: '',
        sort: 0,
        status: 1
      },
      dialogRules: {
        dictCode: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
        dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }]
      },
      submitLoading: false,
      // 字典项弹窗
      itemDialogVisible: false,
      itemDialogTitle: '',
      currentDictCode: '',
      currentDictName: '',
      itemList: [],
      itemLoading: false,
      itemDialogType: 'create',
      itemFormVisible: false,
      itemFormData: {
        id: null,
        dictCode: '',
        itemCode: '',
        itemName: '',
        itemSort: 0,
        status: 1,
        remark: ''
      },
      itemFormRules: {
        itemCode: [{ required: true, message: '请输入项编码', trigger: 'blur' }],
        itemName: [{ required: true, message: '请输入项名称', trigger: 'blur' }]
      },
      itemSubmitLoading: false
    }
  },
  created() {
    this.loadList()
    this.loadCategories()
  },
  methods: {
    loadList() {
      this.listLoading = true
      fetchTypeList(this.listQuery).then(res => {
        this.list = res.data.list || []
        this.total = res.data.total || 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    loadCategories() {
      fetchCategories().then(res => {
        this.categoryList = res.data || []
      })
    },
    handleStatusChange(row) {
      updateTypeStatus(row.id, row.status === 1 ? 0 : 1).then(() => {
        this.$message.success('状态修改成功')
        this.loadList()
      })
    },
    handleSearch() {
      this.listQuery.pageNum = 1
      this.loadList()
    },
    handleReset() {
      this.listQuery = {
        ...this.listQuery,
        dictName: '',
        dictCode: '',
        category: '',
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
      this.dialogTitle = '添加字典类型'
      this.dialogData = { id: null, dictCode: '', dictName: '', category: '', description: '', sort: 0, status: 1 }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogType = 'update'
      this.dialogTitle = '编辑字典类型'
      this.dialogData = { ...row }
      this.dialogVisible = true
    },
    handleItems(row) {
      this.currentDictCode = row.dictCode
      this.currentDictName = row.dictName
      this.itemDialogTitle = `${row.dictName}（${row.dictCode}）`
      this.itemDialogVisible = true
      this.loadItemList()
    },
    handleDelete(row) {
      this.$confirm('确定要删除该字典类型吗？删除后该类型下所有字典项也会被删除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteType(row.id).then(() => {
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
          ? createType(this.dialogData)
          : updateType(this.dialogData.id, this.dialogData)
        promise.then(() => {
          this.$message.success(this.dialogType === 'create' ? '添加成功' : '更新成功')
          this.dialogVisible = false
          this.loadList()
          this.loadCategories()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    // 字典项相关方法
    loadItemList() {
      this.itemLoading = true
      fetchItemList({ dictCode: this.currentDictCode }).then(res => {
        this.itemList = res.data || []
      }).finally(() => {
        this.itemLoading = false
      })
    },
    handleItemCreate() {
      this.itemDialogType = 'create'
      this.itemFormData = { id: null, dictCode: this.currentDictCode, itemCode: '', itemName: '', itemSort: 0, status: 1, remark: '' }
      this.itemFormVisible = true
    },
    handleItemEdit(row) {
      this.itemDialogType = 'update'
      this.itemFormData = { ...row }
      this.itemFormVisible = true
    },
    handleItemDelete(row) {
      this.$confirm('确定要删除该字典项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteItem(row.id).then(() => {
          this.$message.success('删除成功')
          this.loadItemList()
        })
      })
    },
    handleItemStatusChange(row) {
      updateItemStatus(row.id, row.status === 1 ? 0 : 1).then(() => {
        this.$message.success('状态修改成功')
        this.loadItemList()
      })
    },
    handleItemSubmit() {
      this.$refs.itemFormRef.validate(valid => {
        if (!valid) return
        this.itemSubmitLoading = true
        const promise = this.itemDialogType === 'create'
          ? createItem(this.itemFormData)
          : updateItem(this.itemFormData.id, this.itemFormData)
        promise.then(() => {
          this.$message.success(this.itemDialogType === 'create' ? '添加成功' : '更新成功')
          this.itemFormVisible = false
          this.loadItemList()
        }).finally(() => {
          this.itemSubmitLoading = false
        })
      })
    },
    formatDate(val) {
      if (!val) return '-'
      const d = new Date(val)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.dict-type-container {
  padding: 20px;
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
.item-toolbar {
  margin-bottom: 15px;
}
</style>