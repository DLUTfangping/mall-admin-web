<template>
  <div class="medicine-stock-in">
    <div class="filter-container">
      <el-select v-model="listQuery.pharmacyId" placeholder="出库药房" clearable style="width: 150px">
        <el-option v-for="p in pharmacyList" :key="p.id" :label="p.pharmacyName" :value="p.id" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="出库单号" style="width: 220px;" clearable/>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增出库</el-button>
    </div>

    <!-- 列表 -->
    <el-table v-loading="listLoading" :data="list" border stripe style="width: 100%">
      <el-table-column label="ID" prop="id" width="80" align="center" />
      <el-table-column label="出库单号" prop="outNo" width="160" align="center" />
      <el-table-column label="出库药房" prop="pharmacyName" width="120" align="center" />
      <el-table-column label="出库方式" width="100" align="center">
        <template slot-scope="scope">
          <span>{{ getOutTypeLabel(scope.row.outType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" prop="operator" width="100" align="center" />
      <el-table-column label="操作时间" width="160" align="center">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column label="操作" width="160" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleView(scope.row)">查看</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="1100px">
      <el-form ref="stockOutForm" :model="stockOutForm" :rules="rules" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="出库药房" prop="pharmacyId">
              <el-select v-model="stockOutForm.pharmacyId" placeholder="请选择药房" style="width: 100%" @change="handlePharmacyChange">
                <el-option v-for="p in pharmacyList" :key="p.id" :label="p.pharmacyName" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出库方式" prop="outType">
              <el-select v-model="stockOutForm.outType" placeholder="请选择出库方式" style="width: 100%">
                <el-option label="正常出库" value="NORMAL" />
                <el-option label="信息错误" value="ERROR" />
                <el-option label="过期出库" value="EXPIRED" />
                <el-option label="报损出库" value="DAMAGED" />
                <el-option label="盘点出库" value="INVENTORY" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注">
              <el-input v-model="stockOutForm.remark" placeholder="请输入备注" />
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
                    <td class="col-code">药材编码</td>
                    <td class="col-name">药材名称</td>
                    <td class="col-common">通用名</td>
                    <td class="col-type">药材类型</td>
                    <td class="col-rx">处方药分类</td>
                    <td class="col-cat">药品分类</td>
                    <td class="col-batch">批号</td>
                    <td class="col-stock">库存</td>
                    <td class="col-dosage">剂型</td>
                    <td class="col-spec">包装规格</td>
                    <td class="col-mfr">生产厂家</td>
                  </tr>
                </table>
              </el-option>
              <el-option v-for="d in drugList" :key="d.drugId + '_' + d.batchNo" :label="d.drugName + ' [' + d.batchNo + ']'" :value="d.drugId" class="drug-option-row">
                <table class="drug-option-table">
                  <tr>
                    <td class="col-code">{{ d.drugCode }}</td>
                    <td class="col-name">{{ d.drugName }}</td>
                    <td class="col-common">{{ d.commonName || '-' }}</td>
                    <td class="col-type">{{ getDrugTypeLabel(d.drugType) }}</td>
                    <td class="col-rx">{{ getPrescriptionTypeLabel(d.prescriptionType) }}</td>
                    <td class="col-cat">{{ getDrugCategoryLabel(d.drugCategory) }}</td>
                    <td class="col-batch">{{ d.batchNo }}</td>
                    <td class="col-stock" style="color: #67C23A; font-weight: bold;">{{ d.quantity }} {{ d.baseUnit || '' }}</td>
                    <td class="col-dosage">{{ getDosageFormLabel(d.dosageForm) }}</td>
                    <td class="col-spec">{{ d.spec || '-' }}</td>
                    <td class="col-mfr">{{ d.manufacturer || '-' }}</td>
                  </tr>
                </table>
              </el-option>
            </el-select>
            <el-button v-if="stockOutForm.pharmacyId" type="primary" size="small" icon="el-icon-plus" style="background: linear-gradient(135deg, #67C23A 0%, #5aaf2f 100%); border: none; border-radius: 6px; font-weight: 500; padding: 8px 20px;" @click="handleAddAll">
              全部出库
            </el-button>
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
              <div class="info-item">
                <span class="info-label">当前库存</span>
                <span class="info-value" style="color: #67C23A; font-weight: bold;">{{ addDrugForm.stockQuantity || 0 }}</span>
              </div>
              <div class="info-item info-item-wide">
                <span class="info-label">生产厂家</span>
                <span class="info-value">{{ addDrugForm.manufacturer || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 药品出库信息输入 -->
          <div v-if="addDrugForm.drugId" class="drug-input-row">
            <div class="input-group">
              <label class="input-label">出库单位</label>
              <el-select v-model="addDrugForm.unitType" placeholder="单位" style="width: 100px;">
                <el-option :label="addDrugForm.unit || '包装'" value="PACK" />
                <el-option :label="addDrugForm.baseUnit || '基本'" value="BASE" />
              </el-select>
            </div>
            <div class="input-group">
              <label class="input-label">批号</label>
              <el-select v-model="addDrugForm.batchNo" placeholder="选择批号" style="width: 140px;" @change="handleBatchChange">
                <el-option v-for="b in batchList" :key="b.batchNo" :label="b.batchNo" :value="b.batchNo">
                  <span>{{ b.batchNo }}</span>
                  <span style="color: #909399; font-size: 11px; margin-left: 8px;">库存: {{ b.quantity }}</span>
                </el-option>
              </el-select>
            </div>
            <div class="input-group">
              <label class="input-label">出库数量</label>
              <el-input-number v-model="addDrugForm.quantity" :min="0" :precision="2" size="small" style="width: 100px;" />
            </div>
            <div class="input-group">
              <label class="input-label">有效期至</label>
              <span style="color: #606266; font-size: 12px;">{{ addDrugForm.expiryDate || '-' }}</span>
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" style="margin-left: 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; border-radius: 6px; font-weight: 500; padding: 8px 20px;" @click="handleAddDrug">添加药品</el-button>
          </div>
        </div>

        <!-- 待出库药品列表 -->
        <div class="drug-list-header">
          <span class="list-title">已添加药品</span>
          <el-button v-if="stockOutForm.details.length > 0" size="small" type="text" style="color: #F56C6C;" @click="handleBatchDelete">
            <i class="el-icon-delete"></i> 批量删除
          </el-button>
        </div>
        <el-table :data="stockOutForm.details" border stripe size="small" class="drug-table" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="40" align="center" />
          <el-table-column label="药材名称" prop="drugName" width="120" align="center" />
          <el-table-column label="通用名" prop="commonName" width="100" align="center" />
          <el-table-column label="药材类型" width="90" align="center">
            <template slot-scope="scope">
              <span>{{ getDrugTypeLabel(scope.row.drugType) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="处方药分类" width="90" align="center">
            <template slot-scope="scope">
              <span>{{ getPrescriptionTypeLabel(scope.row.prescriptionType) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="药品分类" width="90" align="center">
            <template slot-scope="scope">
              <span>{{ getDrugCategoryLabel(scope.row.drugCategory) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="剂型" width="70" align="center">
            <template slot-scope="scope">
              <span>{{ getDosageFormLabel(scope.row.dosageForm) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="批号" prop="batchNo" width="100" align="center" />
          <el-table-column label="包装规格" prop="spec" width="100" align="center" />
          <el-table-column label="生产厂家" prop="manufacturer" min-width="120" align="center" show-overflow-tooltip />
          <el-table-column label="出库单位" width="100" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.unitType === 'PACK' ? scope.row.unit : scope.row.baseUnit }}</span>
            </template>
          </el-table-column>
          <el-table-column label="出库数量" prop="quantity" width="80" align="center" />
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
    <el-dialog title="出库单详情" :visible.sync="viewDialogVisible" width="1100px">
      <el-form label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="出库单号">{{ viewData.outNo }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出库药房">{{ viewData.pharmacyName }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出库方式">{{ getOutTypeLabel(viewData.outType) }}</el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="总数量">{{ viewData.totalQuantity }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作时间">{{ formatDate(viewData.createTime) }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作人">{{ viewData.operator || '-' }}</el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">{{ viewData.remark || '-' }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-divider content-position="left">出库明细</el-divider>
      <el-table :data="viewData.details" border stripe size="small">
        <el-table-column label="药材名称" prop="drugName" width="100" align="center" />
        <el-table-column label="通用名" prop="commonName" width="90" align="center" />
        <el-table-column label="药材类型" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ getDrugTypeLabel(scope.row.drugType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="处方药分类" width="90" align="center">
          <template slot-scope="scope">
            <span>{{ getPrescriptionTypeLabel(scope.row.prescriptionType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="药品分类" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ getDrugCategoryLabel(scope.row.drugCategory) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="剂型" width="70" align="center">
          <template slot-scope="scope">
            <span>{{ getDosageFormLabel(scope.row.dosageForm) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="批号" prop="batchNo" width="100" align="center" />
        <el-table-column label="包装规格" prop="spec" width="90" align="center" />
        <el-table-column label="生产厂家" prop="manufacturer" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column label="出库单位" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.unitType === 'PACK' ? scope.row.unit : scope.row.baseUnit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="出库数量" prop="quantity" width="80" align="center" />
        <el-table-column label="有效期" prop="expiryDate" width="100" align="center" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchStockOutList, getStockOutDetail, createStockOut, updateStockOut, deleteStockOut, getStockByPharmacy } from '@/api/medicine/stockOut'
import { fetchPharmacyList } from '@/api/medicine/pharmacy'

export default {
  name: 'MedicineStockOut',
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      pharmacyList: [],
      drugList: [],
      batchList: [],
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        pharmacyId: null,
        keyword: ''
      },
      dialogFormVisible: false,
      viewDialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      selectedRows: [],
      stockOutForm: {
        id: null,
        pharmacyId: null,
        outType: 'NORMAL',
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
        baseUnit: '',
        unitType: 'PACK',
        batchNo: '',
        batchInfo: null,
        quantity: null,
        expiryDate: '',
        stockQuantity: null
      },
      viewData: {
        details: []
      },
      rules: {
        pharmacyId: [{ required: true, message: '请选择出库药房', trigger: 'change' }],
        outType: [{ required: true, message: '请选择出库方式', trigger: 'change' }]
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
      fetchStockOutList(this.listQuery).then(response => {
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
      if (!this.stockOutForm.pharmacyId) {
        this.drugList = []
        return
      }
      getStockByPharmacy(this.stockOutForm.pharmacyId).then(response => {
        // 显示所有批次，每个批次一条记录
        this.drugList = response.data || []
      })
    },
    handleDrugSelect(drugId) {
      // 如果有batchNo参数，说明是从批次列表选中的
      if (this.addDrugForm.pendingBatchNo) {
        this.addDrugForm.batchNo = this.addDrugForm.pendingBatchNo
        this.addDrugForm.pendingBatchNo = null
        return
      }

      // 查找选中的药品记录（可能有多个批次，取第一个）
      const drug = this.drugList.find(d => d.drugId === drugId)
      if (drug) {
        this.addDrugForm.drugId = drug.drugId
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
        this.addDrugForm.baseUnit = drug.baseUnit
        this.addDrugForm.unitType = 'PACK'
        this.addDrugForm.batchNo = ''
        this.addDrugForm.batchInfo = null
        this.addDrugForm.quantity = null
        this.addDrugForm.expiryDate = ''
        this.addDrugForm.stockQuantity = null

        // 加载该药品在该药房的库存批次
        this.loadBatchList(drugId)
      }
    },
    loadBatchList(drugId) {
      if (!this.stockOutForm.pharmacyId) {
        this.batchList = []
        return
      }
      // 从药房库存中获取该药品的批次信息
      getStockByPharmacy(this.stockOutForm.pharmacyId).then(response => {
        const stockList = response.data || []
        this.batchList = stockList.filter(item => item.drugId === drugId)
        // 计算总库存
        const totalStock = this.batchList.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
        this.addDrugForm.stockQuantity = totalStock
      })
    },
    handleBatchChange(batchNo) {
      const batchInfo = this.batchList.find(b => b.batchNo === batchNo)
      if (batchInfo) {
        this.addDrugForm.batchInfo = batchInfo
        this.addDrugForm.expiryDate = batchInfo.expiryDate
      }
    },
    handlePharmacyChange(pharmacyId) {
      this.stockOutForm.details = []
      this.batchList = []
      this.addDrugForm.batchNo = ''
      this.addDrugForm.batchInfo = null
      this.addDrugForm.expiryDate = ''
    },
    handleAddAll() {
      if (!this.stockOutForm.pharmacyId) {
        this.$message.warning('请先选择出库药房')
        return
      }
      getStockByPharmacy(this.stockOutForm.pharmacyId).then(response => {
        const stockList = response.data || []
        if (stockList.length === 0) {
          this.$message.warning('该药房暂无库存药品')
          return
        }
        // 将所有库存药品添加到出库列表
        this.stockOutForm.details = stockList.map(item => ({
          drugId: item.drugId,
          drugCode: item.drugCode,
          drugName: item.drugName,
          commonName: item.commonName,
          drugType: item.drugType,
          prescriptionType: item.prescriptionType,
          drugCategory: item.drugCategory,
          dosageForm: item.dosageForm,
          spec: item.spec,
          manufacturer: item.manufacturer,
          batchNo: item.batchNo,
          stockQuantity: item.quantity,
          unitType: 'BASE',
          quantity: item.quantity,
          expiryDate: item.expiryDate
        }))
        this.$message.success('已添加全部药品，共 ' + this.stockOutForm.details.length + ' 条')
      })
    },
    handleAddDrug() {
      if (!this.addDrugForm.drugId) {
        this.$message.warning('请选择药品')
        return
      }
      if (!this.addDrugForm.batchNo) {
        this.$message.warning('请选择批号')
        return
      }
      if (!this.addDrugForm.quantity || this.addDrugForm.quantity <= 0) {
        this.$message.warning('请输入有效的出库数量')
        return
      }

      // 查找批次信息获取库存数量
      const batchInfo = this.batchList.find(b => b.batchNo === this.addDrugForm.batchNo)
      const stockQuantity = batchInfo ? batchInfo.quantity : 0

      // 检查是否已存在相同药品相同批号
      const existingIndex = this.stockOutForm.details.findIndex(
        item => item.drugId === this.addDrugForm.drugId && item.batchNo === this.addDrugForm.batchNo
      )

      let currentQuantity = this.addDrugForm.quantity
      if (existingIndex !== -1) {
        // 累加数量时检查总数量是否超过库存
        const existing = this.stockOutForm.details[existingIndex]
        currentQuantity = parseFloat(existing.quantity) + parseFloat(this.addDrugForm.quantity)
        if (currentQuantity > stockQuantity) {
          this.$message.warning('出库数量不能超过库存，当前库存: ' + stockQuantity)
          return
        }
        existing.quantity = currentQuantity
        this.$message.success('数量已累加到现有记录')
      } else {
        // 新增时检查数量是否超过库存
        if (this.addDrugForm.quantity > stockQuantity) {
          this.$message.warning('出库数量不能超过库存，当前库存: ' + stockQuantity)
          return
        }
        const detail = {
          drugId: this.addDrugForm.drugId,
          drugCode: this.addDrugForm.drugCode,
          drugName: this.addDrugForm.drugName,
          commonName: this.addDrugForm.commonName,
          drugType: this.addDrugForm.drugType,
          prescriptionType: this.addDrugForm.prescriptionType,
          drugCategory: this.addDrugForm.drugCategory,
          dosageForm: this.addDrugForm.dosageForm,
          spec: this.addDrugForm.spec,
          manufacturer: this.addDrugForm.manufacturer,
          unit: this.addDrugForm.unit,
          baseUnit: this.addDrugForm.baseUnit,
          unitType: this.addDrugForm.unitType,
          batchNo: this.addDrugForm.batchNo,
          stockQuantity: stockQuantity,
          quantity: this.addDrugForm.quantity,
          expiryDate: this.addDrugForm.expiryDate
        }
        this.stockOutForm.details.push(detail)
        this.$message.success('药品已添加')
      }

      // 重置添加表单
      this.addDrugForm = {
        drugId: null, drugCode: '', drugName: '', commonName: '', drugType: '', prescriptionType: '',
        drugCategory: '', dosageForm: '', spec: '', isEssential: 0, skinTestRequired: 0,
        manufacturer: '', unit: '', baseUnit: '', unitType: 'PACK', batchNo: '', batchInfo: null, quantity: null, expiryDate: '', stockQuantity: null
      }
    },
    handleRemoveDrug(index) {
      this.stockOutForm.details.splice(index, 1)
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
        const ids = this.selectedRows.map(row => row.drugId + '_' + row.batchNo)
        this.stockOutForm.details = this.stockOutForm.details.filter(
          item => !ids.includes(item.drugId + '_' + item.batchNo)
        )
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
      this.dialogTitle = '新增出库'
      this.isEdit = false
      this.dialogFormVisible = true
    },
    handleEdit(row) {
      getStockOutDetail(row.id).then(response => {
        this.stockOutForm = {
          ...response.data,
          details: (response.data.details || []).map(item => ({
            ...item,
            stockQuantity: item.quantity
          }))
        }
        this.dialogTitle = '编辑出库'
        this.isEdit = true
        this.dialogFormVisible = true
      })
    },
    handleView(row) {
      getStockOutDetail(row.id).then(response => {
        this.viewData = response.data || { details: [] }
        this.viewDialogVisible = true
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该出库单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteStockOut(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    },
    submitForm() {
      this.$refs.stockOutForm.validate(valid => {
        if (valid) {
          if (this.stockOutForm.details.length === 0) {
            this.$message.warning('请添加至少一个药品')
            return
          }
          // 计算总数量
          const totalQuantity = this.stockOutForm.details.reduce((sum, item) => sum + (item.quantity || 0), 0)
          this.stockOutForm.totalQuantity = totalQuantity

          if (this.isEdit) {
            updateStockOut(this.stockOutForm.id, this.stockOutForm).then(() => {
              this.$message.success('更新成功')
              this.dialogFormVisible = false
              this.getList()
            })
          } else {
            createStockOut(this.stockOutForm).then(() => {
              this.$message.success('创建成功')
              this.dialogFormVisible = false
              this.getList()
            })
          }
        }
      })
    },
    resetForm() {
      this.stockOutForm = {
        id: null,
        pharmacyId: null,
        outType: 'NORMAL',
        remark: '',
        details: []
      }
      this.addDrugForm = {
        drugId: null, drugCode: '', drugName: '', commonName: '', drugType: '', prescriptionType: '',
        drugCategory: '', dosageForm: '', spec: '', isEssential: 0, skinTestRequired: 0,
        manufacturer: '', unit: '', baseUnit: '', unitType: 'PACK', batchNo: '', batchInfo: null, quantity: null, expiryDate: '', stockQuantity: null
      }
      this.batchList = []
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
    },
    getOutTypeLabel(value) {
      const map = { 'NORMAL': '正常出库', 'ERROR': '信息错误', 'EXPIRED': '过期出库', 'DAMAGED': '报损出库', 'INVENTORY': '盘点出库' }
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
  font-size: 12px;
}
.drug-option-table td {
  padding: 4px 6px;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.drug-option-header .drug-option-table td {
  background-color: #dcdfe6;
  color: #303133;
  font-weight: 500;
  border-bottom: 1px solid #c4c6cc;
}
.col-code { width: 70px; }
.col-name { width: 90px; }
.col-common { width: 70px; }
.col-type { width: 60px; }
.col-rx { width: 70px; }
.col-cat { width: 70px; }
.col-batch { width: 90px; }
.col-stock { width: 70px; text-align: center; }
.col-dosage { width: 60px; }
.col-spec { width: 90px; }
.col-mfr { width: 100px; }
::v-deep .drug-select-popper .el-select-dropdown__item {
  padding: 0 !important;
  height: auto !important;
  line-height: normal !important;
}
::v-deep .drug-select-popper {
  min-width: 900px !important;
}
::v-deep .drug-select-popper .el-select-dropdown__item.hover,
::v-deep .drug-select-popper .el-select-dropdown__item:hover {
  background-color: #f5f7fa;
}
::v-deep .drug-select-popper .selected {
  background-color: #ecf5ff !important;
}
</style>
