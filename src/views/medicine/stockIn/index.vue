<template>
  <div class="medicine-stock-in">
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="900px">
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
        <div class="add-drug-section">
          <!-- 药品搜索选择 -->
          <div class="drug-search-row">
            <el-select v-model="addDrugForm.drugId" filterable placeholder="搜索并选择药品" style="width: 320px;" @focus="loadDrugs" @change="handleDrugSelect" popper-class="drug-select-popper" :popper-append-to-body="true">
              <el-option class="drug-option-header">
                <table class="drug-option-table">
                  <tr>
                    <td style="width: 40px;">药材编码</td>
                    <td style="width: 90px;">药材名称</td>
                    <td style="width: 65px;">通用名</td>
                    <td style="width: 40px;">药材类型</td>
                    <td style="width: 40px;">处方药分类</td>
                    <td style="width: 40px;">药品分类</td>
                    <td style="width: 40px;">剂型</td>
                    <td style="width: 90px;">包装规格</td>
                    <td style="width: 40px;">基本药物</td>
                    <td style="width: 40px;">需要皮试</td>
                    <td style="width: 100px;">生产厂家</td>
                  </tr>
                </table>
              </el-option>
              <el-option v-for="d in drugList" :key="d.id" :label="d.drugName" :value="d.id" class="drug-option-row">
                <table class="drug-option-table">
                  <tr>
                    <td style="width: 40px;">{{ d.drugCode }}</td>
                    <td style="width: 90px;">{{ d.drugName }}</td>
                    <td style="width: 65px;">{{ d.commonName || '-' }}</td>
                    <td style="width: 40px;">{{ getDrugTypeLabel(d.drugType) }}</td>
                    <td style="width: 40px;">{{ getPrescriptionTypeLabel(d.prescriptionType) }}</td>
                    <td style="width: 40px;">{{ getDrugCategoryLabel(d.drugCategory) }}</td>
                    <td style="width: 40px;">{{ getDosageFormLabel(d.dosageForm) }}</td>
                    <td style="width: 90px;">{{ d.spec || '-' }}</td>
                    <td style="width: 40px;">{{ d.isEssential === 1 ? '是' : '否' }}</td>
                    <td style="width: 40px;">{{ d.skinTestRequired === 1 ? '是' : '否' }}</td>
                    <td style="width: 100px;">{{ d.manufacturer || '-' }}</td>
                  </tr>
                </table>
              </el-option>
            </el-select>
          </div>

          <!-- 选中药品信息展示 -->
          <div v-if="addDrugForm.drugId && addDrugForm.drugName" class="drug-info-panel">
            <div class="drug-info-header">
              <span class="drug-name">{{ addDrugForm.drugName }}</span>
              <span class="drug-code">{{ addDrugForm.drugCode }}</span>
            </div>
            <div class="drug-info-grid">
              <div class="info-item">
                <span class="info-label">药材类型</span>
                <span class="info-value">{{ getDrugTypeLabel(addDrugForm.drugType) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">处方药分类</span>
                <span class="info-value">{{ getPrescriptionTypeLabel(addDrugForm.prescriptionType) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">药品分类</span>
                <span class="info-value">{{ getDrugCategoryLabel(addDrugForm.drugCategory) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">剂型</span>
                <span class="info-value">{{ getDosageFormLabel(addDrugForm.dosageForm) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">包装规格</span>
                <span class="info-value">{{ addDrugForm.spec || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">基本药物</span>
                <span class="info-value">{{ addDrugForm.isEssential === 1 ? '是' : '否' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">需要皮试</span>
                <span class="info-value">{{ addDrugForm.skinTestRequired === 1 ? '是' : '否' }}</span>
              </div>
              <div class="info-item info-item-wide">
                <span class="info-label">生产厂家</span>
                <span class="info-value">{{ addDrugForm.manufacturer || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 药品入库信息输入 -->
          <div v-if="addDrugForm.drugId" class="drug-input-row">
            <div class="input-group">
              <label class="input-label">数量</label>
              <el-input-number v-model="addDrugForm.quantity" :min="0" :precision="2" size="small" style="width: 100px;" />
            </div>
            <div class="input-group">
              <label class="input-label">单价</label>
              <el-input v-model="addDrugForm.unitPrice" size="small" style="width: 90px;" placeholder="0.00" />
            </div>
            <div class="input-group">
              <label class="input-label">批号</label>
              <el-input v-model="addDrugForm.batchNo" size="small" style="width: 110px;" placeholder="批号" />
            </div>
            <div class="input-group">
              <label class="input-label">生产日期</label>
              <el-date-picker v-model="addDrugForm.productionDate" type="date" size="small" style="width: 130px;" value-format="yyyy-MM-dd" placeholder="选择日期" />
            </div>
            <div class="input-group">
              <label class="input-label">有效期至</label>
              <el-date-picker v-model="addDrugForm.expiryDate" type="date" size="small" style="width: 130px;" value-format="yyyy-MM-dd" placeholder="选择日期" />
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" style="margin-left: 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; border-radius: 6px; font-weight: 500; padding: 8px 20px;" @click="handleAddDrug">添加药品</el-button>
          </div>
        </div>

        <!-- 待入库药品列表 -->
        <div class="drug-list-header">
          <span class="list-title">已添加药品</span>
          <el-button v-if="stockInForm.details.length > 0" size="small" type="text" style="color: #F56C6C;" @click="handleBatchDelete">
            <i class="el-icon-delete"></i> 批量删除
          </el-button>
        </div>
        <el-table :data="stockInForm.details" border stripe size="small" class="drug-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" align="center" />
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
          <el-table-column label="单价" width="100" align="center">
            <template slot-scope="scope">
              {{ scope.row.unitPrice ? scope.row.unitPrice + '元/' + (scope.row.unit || '') : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="金额" prop="amount" width="80" align="center" />
          <el-table-column label="批号" prop="batchNo" width="100" align="center" />
          <el-table-column label="生产日期" prop="productionDate" width="100" align="center" />
          <el-table-column label="有效期至" prop="expiryDate" width="100" align="center" />
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
    <el-dialog title="入库单详情" :visible.sync="viewDialogVisible" width="900px">
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
        <el-table-column label="单价" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.unitPrice ? scope.row.unitPrice + '元/' + (scope.row.unit || '') : '-' }}
          </template>
        </el-table-column>
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
      selectedRows: [],
      stockInForm: {
        id: null,
        pharmacyId: null,
        supplier: '',
        remark: '',
        details: []
      },
      addDrugForm: {
        drugId: null,
        drugCode: '',
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
        unit: '',
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
        this.addDrugForm.drugCode = drug.drugCode
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
        this.addDrugForm.unit = drug.unit
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

      // 检查是否已存在相同药品（相同drugId和batchNo视为同一记录）
      const existingIndex = this.stockInForm.details.findIndex(
        item => item.drugId === this.addDrugForm.drugId && item.batchNo === this.addDrugForm.batchNo
      )

      if (existingIndex !== -1) {
        // 累加数量
        const existing = this.stockInForm.details[existingIndex]
        existing.quantity = parseFloat(existing.quantity) + parseFloat(this.addDrugForm.quantity)
        existing.unitPrice = this.addDrugForm.unitPrice
        existing.productionDate = this.addDrugForm.productionDate
        existing.expiryDate = this.addDrugForm.expiryDate
        existing.amount = existing.quantity * this.addDrugForm.unitPrice
        this.$message.success('数量已累加到现有记录')
      } else {
        const detail = {
          drugId: this.addDrugForm.drugId,
          drugCode: drug.drugCode,
          drugName: drug.drugName,
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
        unit: this.addDrugForm.unit,
        amount: this.addDrugForm.quantity * this.addDrugForm.unitPrice,
        batchNo: this.addDrugForm.batchNo,
        productionDate: this.addDrugForm.productionDate,
        expiryDate: this.addDrugForm.expiryDate
      }
      this.stockInForm.details.push(detail)
        this.$message.success('药品已添加')
      }

      // 重置添加表单
      this.addDrugForm = {
        drugId: null, drugCode: '', drugName: '', commonName: '', drugType: '', prescriptionType: '',
        drugCategory: '', dosageForm: '', spec: '', isEssential: 0, skinTestRequired: 0,
        manufacturer: '', unit: '', quantity: null, unitPrice: null, batchNo: '', productionDate: '', expiryDate: ''
      }
    },
    handleRemoveDrug(index) {
      this.stockInForm.details.splice(index, 1)
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要删除的药品')
        return
      }
      this.$confirm('确定要删除选中的 ' + this.selectedRows.length + ' 条药品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedRows.map(row => row.drugId)
        this.stockInForm.details = this.stockInForm.details.filter(item => !ids.includes(item.drugId))
        this.$message.success('删除成功')
        this.selectedRows = []
      }).catch(() => {})
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
        drugId: null, drugCode: '', drugName: '', commonName: '', drugType: '', prescriptionType: '',
        drugCategory: '', dosageForm: '', spec: '', isEssential: 0, skinTestRequired: 0,
        manufacturer: '', quantity: null, unitPrice: null, batchNo: '', productionDate: '', expiryDate: ''
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
.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.add-drug-section {
  background: #f8f9fb;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
}
.drug-search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.drug-info-panel {
  background: linear-gradient(135deg, #e8f0ff 0%, #dbeafe 100%);
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 14px;
  color: #1e3a5f;
  border: 1px solid #bfdbfe;
}
.drug-info-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #cbd5e1;
}
.drug-info-header .drug-name {
  font-size: 17px;
  font-weight: 600;
  color: #1e3a5f;
}
.drug-info-header .drug-code {
  font-size: 12px;
  color: #64748b;
}
.drug-info-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-item-wide {
  grid-column: span 1;
}
.info-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}
.drug-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.input-label {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}
.add-drug-form {
  margin-bottom: 15px;
}
.add-drug-form .el-form-item {
  margin-bottom: 10px;
  margin-right: 15px;
}
.drug-table {
  margin-top: 10px;
}
.drug-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 4px;
}
.list-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}
::v-deep .drug-table th {
  background-color: #e8f0ff !important;
  color: #1e3a5f;
  font-weight: 600;
  font-size: 12px;
}
::v-deep .drug-table td {
  font-size: 12px;
}
::v-deep .drug-table tr:hover > td {
  background-color: #f1f5f9;
}
/* 药品下拉表格样式 */
.drug-option-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ebeef5;
  font-size: 12px;
  table-layout: fixed;
}
.drug-option-table td {
  padding: 4px 6px;
  border: 1px solid #ebeef5 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}
.drug-option-header .drug-option-table td {
  background-color: #dcdfe6;
  color: #303133;
  font-weight: 500;
  border-bottom: 1px solid #c4c6cc;
}
::v-deep .drug-select-popper .el-select-dropdown__item {
  padding: 0 !important;
  height: auto !important;
  line-height: normal !important;
}
::v-deep .drug-select-popper {
  width: 760px !important;
}
.col-code { width: 80px; }
.col-name { width: 100px; }
.col-common { width: 80px; }
.col-type { width: 70px; }
.col-rx { width: 70px; }
.col-cat { width: 80px; }
.col-dosage { width: 60px; }
.col-spec { width: 100px; }
.col-essential { width: 60px; }
.col-skin { width: 60px; }
.col-mfr { width: 120px; }
::v-deep .drug-select-popper .el-select-dropdown__item {
  padding: 0 !important;
  height: auto !important;
  line-height: normal !important;
}
::v-deep .drug-select-popper .el-select-dropdown__item.hover,
::v-deep .drug-select-popper .el-select-dropdown__item:hover {
  background-color: #f5f7fa;
}
::v-deep .drug-select-popper .selected {
  background-color: #ecf5ff !important;
}
</style>
