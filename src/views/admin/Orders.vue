<template>
  <div>
    <h2 class="page-title">订单管理（全平台）</h2>
    <el-table :data="orders" v-loading="loading">
      <el-table-column label="订单号" min-width="180">
        <template #default="{ row }"><span class="mono">{{ row.orderNo }}</span></template>
      </el-table-column>
      <el-table-column label="用户" width="120">
        <template #default="{ row }">{{ row.user?.username }}</template>
      </el-table-column>
      <el-table-column label="游戏" min-width="150">
        <template #default="{ row }">{{ row.game?.name }}</template>
      </el-table-column>
      <el-table-column label="金额" width="90">
        <template #default="{ row }"><span class="price">¥{{ row.amount }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="CDK" min-width="180">
        <template #default="{ row }">
          <span v-if="row.cdkCode" class="cdk-mono">{{ row.cdkCode }}</span>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="150">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
    </el-table>
    <div class="pagination" v-if="total > 10">
      <el-pagination v-model:current-page="page" :total="total" :page-size="10"
                     layout="prev, pager, next" @current-change="fetch" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllOrdersApi } from '@/api'
const orders = ref([]), loading = ref(false), total = ref(0), page = ref(1)
const statusMap = { PENDING: {label:'待支付',type:'warning'}, PAID: {label:'已支付',type:'success'}, CANCELLED: {label:'已取消',type:'info'} }
onMounted(fetch)
async function fetch() {
  loading.value = true
  try {
    const res = await getAllOrdersApi({ page: page.value - 1, size: 10 })
    orders.value = res.content || res; total.value = res.totalElements || res.length
  } finally { loading.value = false }
}
function formatDate(s) { return s ? new Date(s).toLocaleString('zh-CN') : '—' }
</script>

<style scoped>
.page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; margin-bottom: 20px; }
.mono, .cdk-mono { font-family: var(--font-mono); font-size: 12px; }
.cdk-mono { color: var(--neon-green); }
.price { color: var(--neon-blue); font-family: var(--font-display); }
.muted { color: var(--text-muted); }
.pagination { margin-top: 20px; display: flex; justify-content: center; }
</style>
