<template>
  <div class="drug-warning">
    <div class="content-header">
      <h3 class="content-title">库存预警</h3>
    </div>
    <div class="filter-container">
      <el-select v-model="listQuery.drugType" placeholder="药材类型" clearable style="width: 150px">
        <el-option label="西药" value="WESTERN" />
        <el-option label="中成药" value="TCM" />
        <el-option label="中药饮片" value="HERB" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="药材名称/编码" style="width: 200px;" clearable/>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border stripe style="width: 100%">
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
      <el-table-column label="最低预警库存" prop="minWarningStock" width="120" align="center"/>
      <el-table-column label="最高预警库存" prop="maxWarningStock" width="120" align="center"/>
      <el-table-column label="有效期预警天数" prop="validityWarningDays" width="120" align="center"/>
      <el-table-column label="批号预警" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.batchWarningEnabled === 1 ? 'danger' : 'info'">
            {{ scope.row.batchWarningEnabled === 1 ? '启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="再订货点" prop="reorderPoint" width="100" align="center"/>
      <el-table-column label="盘点周期(天)" prop="inspectionCycle" width="110" align="center"/>
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">配置</el-button>
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

    <!-- 配置对话框 -->
    <el-dialog title="预警配置" :visible.sync="dialogFormVisible" width="800px">
      <el-form ref="warningForm" :model="warningForm" label-width="110px" size="small">
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="药材编码">
              <el-input v-model="warningForm.drugCode" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="药材名称">
              <el-input v-model="warningForm.drugName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row :gutter="30">
          <el-col :span="8">
            <el-form-item label="最低预警库存">
              <el-input-number v-model="warningForm.minWarningStock" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最高预警库存">
              <el-input-number v-model="warningForm.maxWarningStock" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="再订货点">
              <el-input-number v-model="warningForm.reorderPoint" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row :gutter="30">
          <el-col :span="8">
            <el-form-item label="有效期预警天数">
              <el-input-number v-model="warningForm.validityWarningDays" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="批号预警">
              <el-switch v-model="warningForm.batchWarningEnabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="盘点周期(天)">
              <el-input-number v-model="warningForm.inspectionCycle" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="warningForm.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList } from '@/api/medicine/drug'
import { getDrugWarning, saveDrugWarning } from '@/api/medicine/drugWarning'

export default {
  name: 'DrugWarning',
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        drugType: null,
        keyword: ''
      },
      dialogFormVisible: false,
      warningForm: {
        id: null,
        drugCode: '',
        drugName: '',
        minWarningStock: null,
        maxWarningStock: null,
        validityWarningDays: null,
        batchWarningEnabled: 0,
        reorderPoint: null,
        inspectionCycle: null,
        remark: ''
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
    fetchData() {
      this.listLoading = true
      const params = {
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize
      }
      if (this.listQuery.drugType) params.drugType = this.listQuery.drugType
      if (this.listQuery.keyword && this.listQuery.keyword.trim()) params.keyword = this.listQuery.keyword.trim()

      fetchList(params).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
        this.loadWarningData()
      }).catch(() => {
        this.listLoading = false
      })
    },
    loadWarningData() {
      this.list.forEach(drug => {
        getDrugWarning(drug.drugCode).then(response => {
          if (response.data) {
            drug.minWarningStock = response.data.minWarningStock
            drug.maxWarningStock = response.data.maxWarningStock
            drug.validityWarningDays = response.data.validityWarningDays
            drug.batchWarningEnabled = response.data.batchWarningEnabled
            drug.reorderPoint = response.data.reorderPoint
            drug.inspectionCycle = response.data.inspectionCycle
          }
        }).catch(() => {})
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
    handleEdit(row) {
      getDrugWarning(row.drugCode).then(response => {
        if (response.data) {
          this.warningForm = { ...response.data, drugName: row.drugName }
        } else {
          this.warningForm = {
            id: null,
            drugCode: row.drugCode,
            drugName: row.drugName,
            minWarningStock: null,
            maxWarningStock: null,
            validityWarningDays: null,
            batchWarningEnabled: 0,
            reorderPoint: null,
            inspectionCycle: null,
            remark: ''
          }
        }
        this.dialogFormVisible = true
      })
    },
    submitForm() {
      saveDrugWarning(this.warningForm).then(() => {
        this.$message.success('保存成功')
        this.dialogFormVisible = false
        this.fetchData()
      })
    }
  }
}
</script>

<style scoped>
.drug-warning {
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
