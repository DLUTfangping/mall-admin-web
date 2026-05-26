<template>
  <div class="medicine-drug">
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
      <el-table-column label="药材编码" prop="drugCode" width="120" align="center"/>
      <el-table-column label="药材名称" prop="drugName" width="150" align="center"/>
      <el-table-column label="药材类型" width="100" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.drugType === 'WESTERN'">西药</span>
          <span v-else-if="scope.row.drugType === 'TCM'">中成药</span>
          <span v-else-if="scope.row.drugType === 'HERB'">中药饮片</span>
        </template>
      </el-table-column>
      <el-table-column label="剂型" width="100" align="center">
        <template slot-scope="scope">
          <span>{{ getDosageFormLabel(scope.row.dosageForm) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规格" prop="spec" width="120" align="center"/>
      <el-table-column label="包装单位" prop="unit" width="80" align="center"/>
      <el-table-column label="基本单位" prop="baseUnit" width="80" align="center"/>
      <el-table-column label="转换率" prop="conversionRate" width="80" align="center"/>123
      <el-table-column label="药品分类" width="100" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.drugCategory === 'NORMAL'">普通药品</span>
          <span v-else-if="scope.row.drugCategory === 'ANESTHETIC'">麻醉药品</span>
          <span v-else-if="scope.row.drugCategory === 'PSYCHOTROPIC_I'">精神类I类</span>
          <span v-else-if="scope.row.drugCategory === 'PSYCHOTROPIC_II'">精神类II类</span>
          <span v-else>{{ scope.row.drugCategory || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="生产厂家" prop="manufacturer" min-width="150" align="center" show-overflow-tooltip/>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" width="1000px">
      <el-tabs value="basic" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-form ref="drugForm" :model="drugForm" :rules="rules" label-width="100px" size="small">
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
                <el-form-item label="药品分类" prop="drugCategory">
                  <el-select v-model="drugForm.drugCategory" placeholder="请选择" style="width: 100%">
                    <el-option label="普通药品" value="NORMAL" />
                    <el-option label="麻醉药品" value="ANESTHETIC" />
                    <el-option label="精神类I类" value="PSYCHOTROPIC_I" />
                    <el-option label="精神类II类" value="PSYCHOTROPIC_II" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="剂型" prop="dosageForm">
                  <el-select v-model="drugForm.dosageForm" placeholder="请选择" style="width: 100%">
                    <el-option label="片剂" value="TABLET" />
                    <el-option label="胶囊" value="CAPSULE" />
                    <el-option label="注射剂" value="INJECTION" />
                    <el-option label="颗粒" value="GRANULE" />
                    <el-option label="溶液" value="SOLUTION" />
                    <el-option label="软膏" value="OINTMENT" />
                    <el-option label="贴剂" value="PATCH" />
                    <el-option label="饮片" value="HERB" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="基本药物">
                  <el-switch v-model="drugForm.isEssential" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="基本规格" prop="baseSpec">
                  <el-input v-model="drugForm.baseSpec" placeholder="如：0.75mg/片" @input="updatePackSpec" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="包装单位" prop="unit">
                  <el-input v-model="drugForm.unit" placeholder="盒/瓶" @input="updatePackSpec" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="基本单位" prop="baseUnit">
                  <el-input v-model="drugForm.baseUnit" placeholder="片/粒/克" @input="updatePackSpec" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="转换率" prop="conversionRate">
                  <el-input-number v-model="drugForm.conversionRate" :precision="4" :step="1" style="width: 100%" @change="updatePackSpec" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="包装规格" prop="spec">
                  <el-input v-model="drugForm.spec" placeholder="自动生成" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="需要皮试">
                  <el-switch v-model="drugForm.skinTestRequired" :active-value="1" :inactive-value="0" />
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
                <el-form-item label="医保编码" prop="insuranceCode">
                  <el-input v-model="drugForm.insuranceCode" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="储存条件" prop="storageCondition">
                  <el-input v-model="drugForm.storageCondition" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="默认供应商" prop="defaultSupplier">
                  <el-input v-model="drugForm.defaultSupplier" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="生产厂家" prop="manufacturer">
                  <el-input v-model="drugForm.manufacturer" />
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
        </el-tab-pane>
        <el-tab-pane label="用法用量" name="usage">
          <div class="usage-toolbar">
            <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAddUsage">添加用法</el-button>
          </div>
          <el-table :data="usageList" border stripe size="small">
            <el-table-column label="用法" width="120" align="center">
              <template slot-scope="scope">
                <span>{{ getUsageLabel(scope.row.usage) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="频次" width="120" align="center">
              <template slot-scope="scope">
                <span>{{ getFrequencyLabel(scope.row.frequency) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单次剂量" width="100" align="center">
              <template slot-scope="scope">
                {{ scope.row.singleDose }} {{ scope.row.doseUnit }}
              </template>
            </el-table-column>
            <el-table-column label="日最大剂量" width="100" align="center">
              <template slot-scope="scope">
                {{ scope.row.maxDailyDose || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="适用年龄" width="120" align="center">
              <template slot-scope="scope">
                {{ scope.row.ageRange || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="禁忌症" min-width="150" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.contraindication || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="handleEditUsage(scope.row)">编辑</el-button>
                <el-button size="mini" type="text" style="color: #F56C6C" @click="handleDeleteUsage(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 用法用量编辑对话框 -->
    <el-dialog title="用法用量" :visible.sync="usageDialogVisible" width="600px">
      <el-form ref="usageForm" :model="usageForm" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用法" prop="usage">
              <el-select v-model="usageForm.usage" placeholder="请选择" style="width: 100%">
                <el-option label="口服" value="ORAL" />
                <el-option label="注射" value="INJECTION" />
                <el-option label="静滴" value="IV_DRIP" />
                <el-option label="外用" value="EXTERNAL" />
                <el-option label="吸入" value="INHALATION" />
                <el-option label="直肠给药" value="RECTAL" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="频次" prop="frequency">
              <el-select v-model="usageForm.frequency" placeholder="请选择" style="width: 100%">
                <el-option label="每日1次" value="QD" />
                <el-option label="每日2次" value="BID" />
                <el-option label="每日3次" value="TID" />
                <el-option label="每日4次" value="QID" />
                <el-option label="每12小时" value="Q12H" />
                <el-option label="每8小时" value="Q8H" />
                <el-option label="必要时" value="PRN" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单次剂量">
              <el-input-number v-model="usageForm.singleDose" :precision="4" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="剂量单位">
              <el-select v-model="usageForm.doseUnit" placeholder="请选择" style="width: 100%">
                <el-option label="片" value="片" />
                <el-option label="粒" value="粒" />
                <el-option label="支" value="支" />
                <el-option label="克" value="克" />
                <el-option label="毫升" value="毫升" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日最大剂量">
              <el-input-number v-model="usageForm.maxDailyDose" :precision="4" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用年龄">
              <el-input v-model="usageForm.ageRange" placeholder="如：成人、儿童6-12岁" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="禁忌症">
          <el-input v-model="usageForm.contraindication" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="usageForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="usageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUsageForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, getDrug, createDrug, updateDrug, deleteDrug, updateDrugStatus } from '@/api/medicine/drug'
import { getDrugUsageList, createDrugUsage, updateDrugUsage, deleteDrugUsage } from '@/api/medicine/drugUsage'

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
        dosageForm: '',
        spec: '',
        unit: '',
        baseUnit: '',
        baseSpec: '',
        conversionRate: null,
        manufacturer: '',
        approvalNumber: '',
        barcode: '',
        storageCondition: '',
        minStock: null,
        maxStock: null,
        defaultSupplier: '',
        insuranceCode: '',
        isEssential: 0,
        drugCategory: '',
        skinTestRequired: 0,
        prescriptionType: '',
        remark: ''
      },
      rules: {
        drugCode: [{ required: true, message: '请输入药材编码', trigger: 'blur' }],
        drugName: [{ required: true, message: '请输入药材名称', trigger: 'blur' }],
        drugType: [{ required: true, message: '请选择药材类型', trigger: 'change' }]
      },
      usageList: [],
      usageDialogVisible: false,
      isEditUsage: false,
      usageForm: {
        id: null,
        drugCode: '',
        usage: '',
        frequency: '',
        singleDose: null,
        doseUnit: '',
        maxDailyDose: null,
        ageRange: '',
        contraindication: '',
        remark: '',
        status: 1
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    getDosageFormLabel(value) {
      const map = {
        'TABLET': '片剂',
        'CAPSULE': '胶囊',
        'INJECTION': '注射剂',
        'GRANULE': '颗粒',
        'SOLUTION': '溶液',
        'OINTMENT': '软膏',
        'PATCH': '贴剂',
        'HERB': '饮片'
      }
      return map[value] || value || '-'
    },
    getUsageLabel(value) {
      const map = {
        'ORAL': '口服',
        'INJECTION': '注射',
        'IV_DRIP': '静滴',
        'EXTERNAL': '外用',
        'INHALATION': '吸入',
        'RECTAL': '直肠给药'
      }
      return map[value] || value || '-'
    },
    getFrequencyLabel(value) {
      const map = {
        'QD': '每日1次',
        'BID': '每日2次',
        'TID': '每日3次',
        'QID': '每日4次',
        'Q12H': '每12小时',
        'Q8H': '每8小时',
        'PRN': '必要时'
      }
      return map[value] || value || '-'
    },
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
    updatePackSpec() {
      const { baseSpec, conversionRate, unit, baseUnit } = this.drugForm
      if (baseSpec && conversionRate && unit && baseUnit) {
        this.drugForm.spec = baseSpec + '×' + conversionRate + baseUnit + '/' + unit
      } else {
        this.drugForm.spec = ''
      }
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
      this.usageList = []
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.dialogTitle = '编辑药材'
      this.isEdit = true
      getDrug(row.id).then(response => {
        this.drugForm = response.data
        this.dialogFormVisible = true
        this.loadUsageList(row.drugCode)
      })
    },
    loadUsageList(drugCode) {
      getDrugUsageList(drugCode).then(response => {
        this.usageList = response.data || []
      }).catch(() => {
        this.usageList = []
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
          // 自动拼接包装规格
          if (this.drugForm.baseSpec && this.drugForm.conversionRate && this.drugForm.unit && this.drugForm.baseUnit) {
            this.drugForm.spec = this.drugForm.baseSpec + '×' + this.drugForm.conversionRate + this.drugForm.baseUnit + '/' + this.drugForm.unit
          }
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
        dosageForm: '',
        spec: '',
        unit: '',
        baseUnit: '',
        baseSpec: '',
        conversionRate: null,
        manufacturer: '',
        approvalNumber: '',
        barcode: '',
        storageCondition: '',
        minStock: null,
        maxStock: null,
        defaultSupplier: '',
        insuranceCode: '',
        isEssential: 0,
        drugCategory: '',
        skinTestRequired: 0,
        prescriptionType: '',
        remark: ''
      }
    },
    handleAddUsage() {
      this.isEditUsage = false
      this.usageForm = {
        id: null,
        drugCode: this.drugForm.drugCode,
        usage: '',
        frequency: '',
        singleDose: null,
        doseUnit: '',
        maxDailyDose: null,
        ageRange: '',
        contraindication: '',
        remark: '',
        status: 1
      }
      this.usageDialogVisible = true
    },
    handleEditUsage(row) {
      this.isEditUsage = true
      this.usageForm = { ...row }
      this.usageDialogVisible = true
    },
    handleDeleteUsage(row) {
      this.$confirm('确定要删除该用法吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDrugUsage(row.id).then(() => {
          this.$message.success('删除成功')
          this.loadUsageList(this.drugForm.drugCode)
        })
      })
    },
    submitUsageForm() {
      if (this.isEditUsage) {
        updateDrugUsage(this.usageForm.id, this.usageForm).then(() => {
          this.$message.success('更新成功')
          this.usageDialogVisible = false
          this.loadUsageList(this.drugForm.drugCode)
        })
      } else {
        createDrugUsage(this.usageForm).then(() => {
          this.$message.success('添加成功')
          this.usageDialogVisible = false
          this.loadUsageList(this.drugForm.drugCode)
        })
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
.usage-toolbar {
  margin-bottom: 10px;
}
</style>
