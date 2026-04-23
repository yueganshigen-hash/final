<template>
  <div>
    <h2 class="page-title">订单管理</h2>
    <el-table :data="orders" v-loading="loading">
      <el-table-column label="订单号" min-width="180">
        <template #default="{ row }"><span class="mono">{{ row.orderNo }}</span></template>
      </el-table-column>
      <el-table-column label="游戏" min-width="150">
        <template #default="{ row }">{{ row.game?.name }}</template>
      </el-table-column>
      <el-table-column label="买家" width="120">
        <template #default="{ row }">{{ row.user?.username }}</template>
      </el-table-column>
      <el-table-column label="金额" width="100">
        <template #default="{ row }"><span class="price">¥{{ row.amount }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="160">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const orders = ref([]), loading = ref(false)
const statusMap = {
  PENDING:   { label: '待支付', type: 'warning' },
  PAID:      { label: '已支付', type: 'success' },
  CANCELLED: { label: '已取消', type: 'info' },
}
onMounted(async () => {
  loading.value = true
  try { orders.value = await request.get('/orders/merchant') }
  finally { loading.value = false }
})
function formatDate(s) { return s ? new Date(s).toLocaleString('zh-CN') : '—' }
</script>

<style scoped>
.page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; margin-bottom: 20px; }
.mono { font-family: var(--font-mono); font-size: 12px; }
.price { color: var(--neon-blue); font-family: var(--font-display); font-size: 15px; }
</style>
