<template>
  <div class="medicine-drug">
    <div class="content-header">
      <h3 class="content-title">药材字典</h3>
    </div>
    <div class="filter-container">
      <el-select v-model="listQuery.drugType" placeholder="药材类型" clearable style="width: 150px">
        <el-option label="西药" value="WESTERN" />
        <el-option label="中成药" value="TCM" />
        <el-option label="中药饮片" value="HERB" />
      </el-select>
      <el-select v-model="listQuery.prescriptionType" placeholder="处方药分类" clearable style="width: 150px">
        <el-option label="处方药" value="OTC_RX" />
        <el-option label="非处方药" value="OTC_OTC" />
        <el-option label="双跨" value="OTC_BOTH" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 100px">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="药材名称/编码" style="width: 200px;" clearable/>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加药材</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border stripe style="width: 100%">
      <el-table-column label="ID" prop="id" width="80" align="center"/>
      <el-table-column label="药材编码" prop="drugCode" align="center"/>
      <el-table-column label="药材名称" prop="drugName" align="center"/>
      <el-table-column label="通用名" prop="commonName" align="center"/>
      <el-table-column label="药材类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.drugType === 'WESTERN'">西药</span>
          <span v-else-if="scope.row.drugType === 'TCM'">中成药</span>
          <span v-else-if="scope.row.drugType === 'HERB'">中药饮片</span>
        </template>
      </el-table-column>
      <el-table-column label="规格" prop="spec" align="center"/>
      <el-table-column label="单位" prop="unit" width="80" align="center"/>
      <el-table-column label="生产厂家" prop="manufacturer" align="center" show-overflow-tooltip/>
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-switch
            :value="scope.row.status === 1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="handlePageChange"
    />

    <!-- 创建/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="900px">
      <el-form ref="drugForm" :model="drugForm" :rules="rules" label-width="90px" size="small">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="药材编码" prop="drugCode">
              <el-input v-model="drugForm.drugCode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="药材名称" prop="drugName">
              <el-input v-model="drugForm.drugName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="通用名" prop="commonName">
              <el-input v-model="drugForm.commonName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="英文名" prop="englishName">
              <el-input v-model="drugForm.englishName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="药材类型" prop="drugType">
              <el-select v-model="drugForm.drugType" placeholder="请选择" style="width: 100%">
                <el-option label="西药" value="WESTERN" />
                <el-option label="中成药" value="TCM" />
                <el-option label="中药饮片" value="HERB" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="处方药分类" prop="prescriptionType">
              <el-select v-model="drugForm.prescriptionType" placeholder="请选择" style="width: 100%">
                <el-option label="处方药" value="OTC_RX" />
                <el-option label="非处方药" value="OTC_OTC" />
                <el-option label="双跨" value="OTC_BOTH" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="规格" prop="spec">
              <el-input v-model="drugForm.spec" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="drugForm.unit" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="drugForm.manufacturer" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="批准文号" prop="approvalNumber">
              <el-input v-model="drugForm.approvalNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="条形码" prop="barcode">
              <el-input v-model="drugForm.barcode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="储存条件" prop="storageCondition">
              <el-input v-model="drugForm.storageCondition" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最低库存" prop="minStock">
              <el-input-number v-model="drugForm.minStock" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最高库存" prop="maxStock">
              <el-input-number v-model="drugForm.maxStock" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="默认供应商" prop="defaultSupplier">
              <el-input v-model="drugForm.defaultSupplier" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="医保编码" prop="insuranceCode">
              <el-input v-model="drugForm.insuranceCode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="基本药物">
              <el-switch v-model="drugForm.isEssential" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="drugForm.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, getDrug, createDrug, updateDrug, deleteDrug, updateDrugStatus } from '@/api/medicine/drug'

export default {
  name: 'MedicineDrug',
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        drugType: null,
        prescriptionType: null,
        status: null,
        keyword: ''
      },
      dialogFormVisible: false,
      dialogTitle: '',
      isEdit: false,
      drugForm: {
        id: null,
        drugCode: '',
        drugName: '',
        commonName: '',
        englishName: '',
        drugType: '',
        spec: '',
        unit: '',
        manufacturer: '',
        approvalNumber: '',
        barcode: '',
        storageCondition: '',
        minStock: null,
        maxStock: null,
        defaultSupplier: '',
        insuranceCode: '',
        isEssential: 0,
        prescriptionType: '',
        remark: ''
      },
      rules: {
        drugCode: [{ required: true, message: '请输入药材编码', trigger: 'blur' }],
        drugName: [{ required: true, message: '请输入药材名称', trigger: 'blur' }],
        drugType: [{ required: true, message: '请选择药材类型', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      const params = {
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize
      }
      if (this.listQuery.drugType) params.drugType = this.listQuery.drugType
      if (this.listQuery.prescriptionType) params.prescriptionType = this.listQuery.prescriptionType
      if (this.listQuery.status !== null && this.listQuery.status !== '') params.status = this.listQuery.status
      if (this.listQuery.keyword && this.listQuery.keyword.trim()) params.keyword = this.listQuery.keyword.trim()

      fetchList(params).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSearch() {
      this.listQuery.pageNum = 1
      this.fetchData()
    },
    handlePageChange(val) {
      this.listQuery.pageNum = val
      this.fetchData()
    },
    handleCreate() {
      this.dialogTitle = '添加药材'
      this.isEdit = false
      this.resetForm()
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.dialogTitle = '编辑药材'
      this.isEdit = true
      getDrug(row.id).then(response => {
        this.drugForm = response.data
        this.dialogFormVisible = true
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该药材吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDrug(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        })
      })
    },
    handleStatusChange(row) {
      const newStatus = row.status === 1 ? 0 : 1
      updateDrugStatus(row.id, newStatus).then(() => {
        this.$message.success('状态修改成功')
        this.fetchData()
      })
    },
    submitForm() {
      this.$refs.drugForm.validate(valid => {
        if (valid) {
          if (this.isEdit) {
            updateDrug(this.drugForm.id, this.drugForm).then(() => {
              this.$message.success('更新成功')
              this.dialogFormVisible = false
              this.fetchData()
            })
          } else {
            createDrug(this.drugForm).then(() => {
              this.$message.success('添加成功')
              this.dialogFormVisible = false
              this.fetchData()
            })
          }
        }
      })
    },
    resetForm() {
      this.drugForm = {
        id: null,
        drugCode: '',
        drugName: '',
        commonName: '',
        englishName: '',
        drugType: '',
        spec: '',
        unit: '',
        manufacturer: '',
        approvalNumber: '',
        barcode: '',
        storageCondition: '',
        minStock: null,
        maxStock: null,
        defaultSupplier: '',
        insuranceCode: '',
        isEssential: 0,
        prescriptionType: '',
        remark: ''
      }
    }
  }
}
</script>

<style scoped>
.medicine-drug {
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
