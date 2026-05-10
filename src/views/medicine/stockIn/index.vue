<template>
  <div class="medicine-stock-in">
    <div class="content-header">
      <h3 class="content-title">药材入库</h3>
    </div>
    <div class="filter-container">
      <el-select v-model="listQuery.pharmacyId" placeholder="入库药房" clearable style="width: 150px">
        <el-option v-for="p in pharmacyList" :key="p.id" :label="p.pharmacyName" :value="p.id" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="草稿" :value="0" />
        <el-option label="已入库" :value="1" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="入库单号/供应商/操作人" style="width: 220px;" clearable/>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增入库</el-button>
    </div>

    <!-- 列表 -->
    <el-table v-loading="listLoading" :data="list" border stripe style="width: 100%">
      <el-table-column label="ID" prop="id" width="80" align="center" />
      <el-table-column label="入库单号" prop="inNo" width="160" align="center" />
      <el-table-column label="入库药房" prop="pharmacyName" width="120" align="center" />
      <el-table-column label="供应商" prop="supplier" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column label="总金额" prop="totalAmount" width="100" align="center" />
      <el-table-column label="操作人" prop="operator" width="100" align="center" />
      <el-table-column label="操作时间" width="160" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.status === 1 ? '已入库' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleView(scope.row)">查看</el-button>
          <el-button v-if="scope.row.status === 0" size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.status === 0" size="mini" type="text" style="color: #67C23A" @click="handleConfirm(scope.row)">确认入库</el-button>
          <el-button v-if="scope.row.status === 0" size="mini" type="text" style="color: #F56C6C" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="1100px">
      <el-form ref="stockInForm" :model="stockInForm" :rules="rules" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="入库药房" prop="pharmacyId">
              <el-select v-model="stockInForm.pharmacyId" placeholder="请选择药房" style="width: 100%">
                <el-option v-for="p in pharmacyList" :key="p.id" :label="p.pharmacyName" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="stockInForm.supplier" placeholder="请输入供应商" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注">
              <el-input v-model="stockInForm.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 添加药品区域 -->
        <el-divider content-position="left">添加药品</el-divider>
        <el-row :gutter="20" class="add-drug-row">
          <el-col :span="6">
            <el-select v-model="addDrugForm.drugId" filterable placeholder="选择药品(支持搜索)" style="width: 100%" @focus="loadDrugs" @change="handleDrugSelect">
              <el-option v-for="d in drugList" :key="d.id" :label="d.drugName" :value="d.id">
                <span style="float: left">{{ d.drugName }}</span>
                <span style="float: right; color: #8492a6; font-size: 12px">{{ d.drugCode }}</span>
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-input-number v-model="addDrugForm.quantity" :min="0" :precision="2" placeholder="数量" style="width: 100%" />
          </el-col>
          <el-col :span="3">
            <el-input v-model="addDrugForm.unitPrice" placeholder="单价" style="width: 100%" />
          </el-col>
          <el-col :span="3">
            <el-input v-model="addDrugForm.batchNo" placeholder="批号" style="width: 100%" />
          </el-col>
          <el-col :span="4">
            <el-date-picker v-model="addDrugForm.productionDate" type="date" placeholder="生产日期" style="width: 100%" value-format="yyyy-MM-dd" />
          </el-col>
          <el-col :span="5">
            <el-date-picker v-model="addDrugForm.expiryDate" type="date" placeholder="有效期" style="width: 100%" value-format="yyyy-MM-dd" />
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-bottom: 15px;">
          <el-col :span="24">
            <el-button type="primary" icon="el-icon-plus" @click="handleAddDrug">添加</el-button>
          </el-col>
        </el-row>

        <!-- 待入库药品列表 -->
        <el-table :data="stockInForm.details" border stripe size="small" class="drug-table">
          <el-table-column label="药材名称" prop="drugName" width="120" align="center" />
          <el-table-column label="通用名" prop="commonName" width="100" align="center" />
          <el-table-column label="药材类型" width="100" align="center">
            <template slot-scope="scope">
              <span>{{ getDrugTypeLabel(scope.row.drugType) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="处方药分类" width="100" align="center">
            <template slot-scope="scope">
              <span>{{ getPrescriptionTypeLabel(scope.row.prescriptionType) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="药品分类" width="100" align="center">
            <template slot-scope="scope">
              <span>{{ getDrugCategoryLabel(scope.row.drugCategory) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="剂型" width="80" align="center">
            <template slot-scope="scope">
              <span>{{ getDosageFormLabel(scope.row.dosageForm) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="包装规格" prop="spec" width="120" align="center" />
          <el-table-column label="基本药物" width="80" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.isEssential === 1 ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="需要皮试" width="80" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.skinTestRequired === 1 ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="生产厂家" prop="manufacturer" min-width="150" align="center" show-overflow-tooltip />
          <el-table-column label="数量" prop="quantity" width="80" align="center" />
          <el-table-column label="单价" prop="unitPrice" width="80" align="center" />
          <el-table-column label="金额" prop="amount" width="80" align="center" />
          <el-table-column label="批号" prop="batchNo" width="100" align="center" />
          <el-table-column label="操作" width="60" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="text" style="color: #F56C6C" @click="handleRemoveDrug(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog title="入库单详情" :visible.sync="viewDialogVisible" width="1100px">
      <el-form label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="入库单号">{{ viewData.inNo }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="入库药房">{{ viewData.pharmacyName }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="供应商">{{ viewData.supplier || '-' }}</el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="总金额">{{ viewData.totalAmount }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作人">{{ viewData.operator }}</el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="状态">
              <el-tag :type="viewData.status === 1 ? 'success' : 'info'" size="small">
                {{ viewData.status === 1 ? '已入库' : '草稿' }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作时间">{{ formatDate(viewData.createTime) }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注">{{ viewData.remark || '-' }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-divider content-position="left">入库明细</el-divider>
      <el-table :data="viewData.details" border stripe size="small">
        <el-table-column label="药材名称" prop="drugName" width="120" align="center" />
        <el-table-column label="通用名" prop="commonName" width="100" align="center" />
        <el-table-column label="药材类型" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ getDrugTypeLabel(scope.row.drugType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="处方药分类" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ getPrescriptionTypeLabel(scope.row.prescriptionType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="药品分类" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ getDrugCategoryLabel(scope.row.drugCategory) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="剂型" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ getDosageFormLabel(scope.row.dosageForm) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="包装规格" prop="spec" width="120" align="center" />
        <el-table-column label="基本药物" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.isEssential === 1 ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="需要皮试" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.skinTestRequired === 1 ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生产厂家" prop="manufacturer" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column label="数量" prop="quantity" width="80" align="center" />
        <el-table-column label="单价" prop="unitPrice" width="80" align="center" />
        <el-table-column label="金额" prop="amount" width="80" align="center" />
        <el-table-column label="批号" prop="batchNo" width="100" align="center" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchStockInList, getStockInDetail, createStockIn, updateStockIn, deleteStockIn, confirmStockIn, searchDrugs } from '@/api/medicine/stockIn'
import { fetchPharmacyList } from '@/api/medicine/pharmacy'

export default {
  name: 'MedicineStockIn',
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      pharmacyList: [],
      drugList: [],
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        pharmacyId: null,
        status: null,
        keyword: ''
      },
      dialogFormVisible: false,
      viewDialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      stockInForm: {
        id: null,
        pharmacyId: null,
        supplier: '',
        remark: '',
        details: []
      },
      addDrugForm: {
        drugId: null,
        drugName: '',
        commonName: '',
        drugType: '',
        prescriptionType: '',
        drugCategory: '',
        dosageForm: '',
        spec: '',
        isEssential: 0,
        skinTestRequired: 0,
        manufacturer: '',
        quantity: null,
        unitPrice: null,
        batchNo: '',
        productionDate: '',
        expiryDate: ''
      },
      viewData: {
        details: []
      },
      rules: {
        pharmacyId: [{ required: true, message: '请选择入库药房', trigger: 'change' }]
      }
    }
  },
  created() {
    this.loadPharmacies()
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchStockInList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    loadPharmacies() {
      fetchPharmacyList({ pageSize: 100, status: 1 }).then(response => {
        this.pharmacyList = response.data.list
      })
    },
    loadDrugs() {
      searchDrugs('').then(response => {
        this.drugList = response.data || []
      })
    },
    handleDrugSelect(drugId) {
      const drug = this.drugList.find(d => d.id === drugId)
      if (drug) {
        this.addDrugForm.drugName = drug.drugName
        this.addDrugForm.commonName = drug.commonName
        this.addDrugForm.drugType = drug.drugType
        this.addDrugForm.prescriptionType = drug.prescriptionType
        this.addDrugForm.drugCategory = drug.drugCategory
        this.addDrugForm.dosageForm = drug.dosageForm
        this.addDrugForm.spec = drug.spec
        this.addDrugForm.isEssential = drug.isEssential
        this.addDrugForm.skinTestRequired = drug.skinTestRequired
        this.addDrugForm.manufacturer = drug.manufacturer
      }
    },
    handleAddDrug() {
      if (!this.addDrugForm.drugId) {
        this.$message.warning('请选择药品')
        return
      }
      if (!this.addDrugForm.quantity || this.addDrugForm.quantity <= 0) {
        this.$message.warning('请输入有效的入库数量')
        return
      }
      const drug = this.drugList.find(d => d.id === this.addDrugForm.drugId)
      if (!drug) {
        this.$message.warning('请选择药品')
        return
      }

      const detail = {
        drugId: this.addDrugForm.drugId,
        drugCode: drug.drugCode,
        drugName: this.addDrugForm.drugName,
        commonName: this.addDrugForm.commonName,
        drugType: this.addDrugForm.drugType,
        prescriptionType: this.addDrugForm.prescriptionType,
        drugCategory: this.addDrugForm.drugCategory,
        dosageForm: this.addDrugForm.dosageForm,
        spec: this.addDrugForm.spec,
        isEssential: this.addDrugForm.isEssential,
        skinTestRequired: this.addDrugForm.skinTestRequired,
        manufacturer: this.addDrugForm.manufacturer,
        quantity: this.addDrugForm.quantity,
        unitPrice: this.addDrugForm.unitPrice,
        amount: this.addDrugForm.quantity * this.addDrugForm.unitPrice,
        batchNo: this.addDrugForm.batchNo,
        productionDate: this.addDrugForm.productionDate,
        expiryDate: this.addDrugForm.expiryDate
      }
      this.stockInForm.details.push(detail)

      // 重置添加表单
      this.addDrugForm = {
        drugId: null, drugName: '', commonName: '', drugType: '', prescriptionType: '',
        drugCategory: '', dosageForm: '', spec: '', isEssential: 0, skinTestRequired: 0,
        manufacturer: '', quantity: null, unitPrice: null, batchNo: '', productionDate: '', expiryDate: ''
      }
    },
    handleRemoveDrug(index) {
      this.stockInForm.details.splice(index, 1)
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
      this.dialogTitle = '新增入库'
      this.isEdit = false
      this.dialogFormVisible = true
    },
    handleEdit(row) {
      getStockInDetail(row.id).then(response => {
        this.stockInForm = {
          ...response.data,
          details: response.data.details || []
        }
        this.dialogTitle = '编辑入库'
        this.isEdit = true
        this.dialogFormVisible = true
      })
    },
    handleView(row) {
      getStockInDetail(row.id).then(response => {
        this.viewData = response.data || { details: [] }
        this.viewDialogVisible = true
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该入库单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteStockIn(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    },
    handleConfirm(row) {
      this.$confirm('确定要确认入库吗？确认后将更新库存。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        confirmStockIn(row.id).then(() => {
          this.$message.success('入库确认成功')
          this.getList()
        })
      })
    },
    submitForm() {
      this.$refs.stockInForm.validate(valid => {
        if (valid) {
          if (this.stockInForm.details.length === 0) {
            this.$message.warning('请添加至少一个药品')
            return
          }
          this.stockInForm.operator = this.$store.state.user.name || 'admin'
          if (this.isEdit) {
            updateStockIn(this.stockInForm.id, this.stockInForm).then(() => {
              this.$message.success('更新成功')
              this.dialogFormVisible = false
              this.getList()
            })
          } else {
            createStockIn(this.stockInForm).then(() => {
              this.$message.success('创建成功')
              this.dialogFormVisible = false
              this.getList()
            })
          }
        }
      })
    },
    resetForm() {
      this.stockInForm = {
        id: null,
        pharmacyId: null,
        supplier: '',
        remark: '',
        details: []
      }
      this.addDrugForm = {
        drugId: null, drugName: '', commonName: '', drugType: '', prescriptionType: '',
        drugCategory: '', dosageForm: '', spec: '', isEssential: 0, skinTestRequired: 0,
        manufacturer: '', quantity: null, batchNo: '', productionDate: '', expiryDate: ''
      }
    },
    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    getDrugTypeLabel(value) {
      const map = { 'WESTERN': '西药', 'TCM': '中成药', 'HERB': '中药饮片' }
      return map[value] || value || '-'
    },
    getPrescriptionTypeLabel(value) {
      const map = { 'OTC_RX': '处方药', 'OTC_OTC': '非处方药', 'OTC_BOTH': '双跨', 'RX': '处方药' }
      return map[value] || value || '-'
    },
    getDrugCategoryLabel(value) {
      const map = { 'NORMAL': '普通药品', 'ANESTHETIC': '麻醉药品', 'PSYCHOTROPIC_I': '精神类I类', 'PSYCHOTROPIC_II': '精神类II类' }
      return map[value] || value || '-'
    },
    getDosageFormLabel(value) {
      const map = { 'TABLET': '片剂', 'CAPSULE': '胶囊', 'INJECTION': '注射剂', 'GRANULE': '颗粒', 'SOLUTION': '溶液', 'OINTMENT': '软膏', 'PATCH': '贴剂', 'HERB': '饮片' }
      return map[value] || value || '-'
    }
  }
}
</script>

<style scoped>
.medicine-stock-in {
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
.add-drug-row {
  margin-bottom: 15px;
}
.drug-table {
  margin-top: 10px;
}
</style>
