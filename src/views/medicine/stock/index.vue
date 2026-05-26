<template>
  <div class="medicine-stock" :key="viewMode">
    <div class="filter-container">
      <el-radio-group v-model="viewMode" size="small" style="margin-right: 15px;">
        <el-radio-button label="batch">批次视图</el-radio-button>
        <el-radio-button label="summary">药品总库存</el-radio-button>
      </el-radio-group>
      <el-select v-model="listQuery.pharmacyId" placeholder="药房" clearable style="width: 150px">
        <el-option v-for="p in pharmacyList" :key="p.id" :label="p.pharmacyName" :value="p.id" />
      </el-select>
      <el-input v-model="listQuery.drugName" placeholder="药品名称" style="width: 150px;" clearable />
      <el-input v-model="listQuery.batchNo" placeholder="批号" style="width: 120px;" clearable v-if="viewMode === 'batch'" />
      <el-select v-model="listQuery.drugCategory" placeholder="药品分类" clearable style="width: 130px">
        <el-option label="普通药品" value="NORMAL" />
        <el-option label="麻醉药品" value="ANESTHETIC" />
        <el-option label="精神类I类" value="PSYCHOTROPIC_I" />
        <el-option label="精神类II类" value="PSYCHOTROPIC_II" />
      </el-select>
      <el-select v-model="listQuery.drugType" placeholder="药材类型" clearable style="width: 120px">
        <el-option label="西药" value="WESTERN" />
        <el-option label="中成药" value="TCM" />
        <el-option label="中药饮片" value="HERB" />
      </el-select>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
    </div>

    <!-- 批次视图 -->
    <el-table v-loading="listLoading" :data="list" border stripe style="width: 100%" v-if="viewMode === 'batch'" key="batch-table">
      <el-table-column label="药房" prop="pharmacyName" width="100" align="center" />
      <el-table-column label="药材编码" prop="drugCode" width="100" align="center" />
      <el-table-column label="药材名称" prop="drugName" width="120" align="center" />
      <el-table-column label="通用名" prop="commonName" width="100" align="center" />
      <el-table-column label="药材类型" width="80" align="center">
        <template slot-scope="scope">{{ getDrugTypeLabel(scope.row.drugType) }}</template>
      </el-table-column>
      <el-table-column label="处方药分类" width="100" align="center">
        <template slot-scope="scope">{{ getPrescriptionTypeLabel(scope.row.prescriptionType) }}</template>
      </el-table-column>
      <el-table-column label="药品分类" width="100" align="center">
        <template slot-scope="scope">{{ getDrugCategoryLabel(scope.row.drugCategory) }}</template>
      </el-table-column>
      <el-table-column label="剂型" width="80" align="center">
        <template slot-scope="scope">{{ getDosageFormLabel(scope.row.dosageForm) }}</template>
      </el-table-column>
      <el-table-column label="包装规格" prop="spec" width="120" align="center" />
      <el-table-column label="基本药物" width="80" align="center">
        <template slot-scope="scope">{{ scope.row.isEssential === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="需要皮试" width="80" align="center">
        <template slot-scope="scope">{{ scope.row.skinTestRequired === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="生产厂家" prop="manufacturer" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column label="批号" prop="batchNo" width="100" align="center" />
      <el-table-column label="当前库存" width="100" align="center">
        <template slot-scope="scope">
          <span v-if="isLowStock(scope.row)" style="color: #F56C6C; font-weight: bold">
            {{ scope.row.quantity }} {{ scope.row.baseUnit || '' }} ⚠
          </span>
          <span v-else>{{ scope.row.quantity }} {{ scope.row.baseUnit || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.unitPrice ? scope.row.unitPrice + '元/' + (scope.row.unit || '') : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="生产日期" width="100" align="center">
        <template slot-scope="scope">{{ formatDate(scope.row.productionDate) }}</template>
      </el-table-column>
      <el-table-column label="有效期" width="100" align="center">
        <template slot-scope="scope">{{ formatDate(scope.row.expiryDate) }}</template>
      </el-table-column>
      <el-table-column label="更新时间" width="150" align="center">
        <template slot-scope="scope">{{ formatDate(scope.row.updateTime) }}</template>
      </el-table-column>
    </el-table>

    <!-- 药品总库存视图 -->
    <el-table v-loading="listLoading" :data="summaryList" border stripe style="width: 100%" v-if="viewMode === 'summary'" key="summary-table">
      <el-table-column label="药房" prop="pharmacyName" width="100" align="center" />
      <el-table-column label="药材编码" prop="drugCode" width="100" align="center" />
      <el-table-column label="药材名称" prop="drugName" width="120" align="center" />
      <el-table-column label="药材类型" width="80" align="center">
        <template slot-scope="scope">{{ getDrugTypeLabel(scope.row.drugType) }}</template>
      </el-table-column>
      <el-table-column label="剂型" width="80" align="center">
        <template slot-scope="scope">{{ getDosageFormLabel(scope.row.dosageForm) }}</template>
      </el-table-column>
      <el-table-column label="包装规格" prop="spec" width="120" align="center" />
      <el-table-column label="生产厂家" prop="manufacturer" min-width="150" align="center" show-overflow-tooltip />
      <el-table-column label="总库存" width="100" align="center">
        <template slot-scope="scope">
          <span v-if="isTotalLowStock(scope.row)" style="color: #F56C6C; font-weight: bold">
            {{ scope.row.totalQuantity }} {{ scope.row.baseUnit || '' }} ⚠
          </span>
          <span v-else-if="isTotalHighStock(scope.row)" style="color: #E6A23C; font-weight: bold">
            {{ scope.row.totalQuantity }} {{ scope.row.baseUnit || '' }} ▲
          </span>
          <span v-else>{{ scope.row.totalQuantity }} {{ scope.row.baseUnit || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="批次数" prop="batchCount" width="70" align="center" />
    </el-table>

    <el-pagination
      v-if="viewMode === 'batch'"
      :current-page="listQuery.pageNum"
      :page-size="listQuery.pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script>
import { fetchStockList } from '@/api/medicine/stock'
import { fetchPharmacyList } from '@/api/medicine/pharmacy'

export default {
  name: 'MedicineStock',
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      summaryList: [],
      pharmacyList: [],
      viewMode: 'batch',
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        pharmacyId: null,
        drugName: '',
        batchNo: '',
        drugCategory: '',
        drugType: ''
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
      fetchStockList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    loadPharmacies() {
      fetchPharmacyList({ pageSize: 100, status: 1 }).then(response => {
        this.pharmacyList = response.data.list || []
      })
    },
    handleSearch() {
      this.listQuery.pageNum = 1
      this.switchView()
    },
    handleReset() {
      this.listQuery = { pageNum: 1, pageSize: 10, pharmacyId: null, drugName: '', batchNo: '', drugCategory: '', drugType: '' }
      this.switchView()
    },
    handlePageChange(page) {
      this.listQuery.pageNum = page
      this.getList()
    },
    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
    isLowStock(row) {
      // 批号预警：启用且库存低于阈值时标红
      if (row.batchWarningEnabled === 1 && row.batchWarningThreshold != null && row.quantity != null) {
        return Number(row.quantity) < Number(row.batchWarningThreshold)
      }
      return false
    },
    isTotalLowStock(row) {
      // 总库存预警：启用且总库存低于最低预警库存时标红
      if (row.minWarningStock != null && row.totalQuantity != null) {
        return Number(row.totalQuantity) < Number(row.minWarningStock)
      }
      return false
    },
    isTotalHighStock(row) {
      // 总库存预警：启用且总库存高于最高预警库存时标橙
      if (row.maxWarningStock != null && row.totalQuantity != null) {
        return Number(row.totalQuantity) > Number(row.maxWarningStock)
      }
      return false
    },
    switchView() {
      if (this.viewMode === 'summary') {
        this.getSummaryList()
      } else {
        this.summaryList = []
        this.list = []
        this.getList()
      }
    },
    getSummaryList() {
      this.listLoading = true
      const query = { pageSize: 1000, pageNum: 1 }
      if (this.listQuery.pharmacyId) query.pharmacyId = this.listQuery.pharmacyId
      if (this.listQuery.drugName) query.drugName = this.listQuery.drugName
      if (this.listQuery.drugCategory) query.drugCategory = this.listQuery.drugCategory
      if (this.listQuery.drugType) query.drugType = this.listQuery.drugType
      fetchStockList(query).then(response => {
        const list = (response.data && response.data.list) || []
        console.log('getSummaryList list:', list.length)
        const map = {}
        for (const item of list) {
          const key = item.pharmacyId + '_' + item.drugId
          if (!map[key]) {
            map[key] = {
              pharmacyId: item.pharmacyId,
              pharmacyName: item.pharmacyName,
              drugId: item.drugId,
              drugCode: item.drugCode,
              drugName: item.drugName,
              drugType: item.drugType,
              dosageForm: item.dosageForm,
              spec: item.spec,
              manufacturer: item.manufacturer,
              minWarningStock: item.minWarningStock,
              maxWarningStock: item.maxWarningStock,
              totalQuantity: 0,
              batchCount: 0
            }
          }
          map[key].totalQuantity += Number(item.quantity || 0)
          map[key].batchCount++
        }
        const newList = Object.values(map)
        console.log('getSummaryList newList:', newList.length)
        this.summaryList = [...newList]
        this.listLoading = false
      }).catch((err) => {
        console.error('getSummaryList error:', err)
        this.listLoading = false
      })
    }
  },
  watch: {
    viewMode() {
      this.switchView()
    }
  }
}
</script>

<style scoped>
.medicine-stock { padding: 20px; }
.content-header { margin-bottom: 20px; }
.content-title { margin: 0; font-size: 18px; font-weight: 500; }
.filter-container { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
</style>