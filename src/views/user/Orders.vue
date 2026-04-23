<template>
  <div class="orders-page">
    <h1 class="page-title">📋 我的订单</h1>

    <div class="loading-wrap" v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="orders.length > 0">
      <div class="order-card" v-for="row in orders" :key="row.id">
        <div class="order-header">
          <span class="order-no">{{ row.orderNo }}</span>
          <el-tag :type="statusMap[row.status]?.type" size="small">
            {{ statusMap[row.status]?.label || row.status }}
          </el-tag>
        </div>

        <div class="order-body">
          <div class="order-game">
            <span class="game-name">{{ row.game?.name || '未知游戏' }}</span>
            <span class="game-genre">{{ row.game?.genre || '' }}</span>
          </div>
          <div class="order-amount">¥{{ row.amount }}</div>
        </div>

        <!-- CDK 展示 -->
        <div class="cdk-row" v-if="row.cdkCode">
          <span class="cdk-label">激活码</span>
          <span class="cdk-code">{{ row.cdkCode }}</span>
          <button class="copy-btn" @click="copy(row.cdkCode)">复制</button>
        </div>

        <div class="order-footer">
          <span class="order-time">{{ formatDate(row.createdAt) }}</span>
          <div class="order-actions">
            <el-button
                v-if="row.status === 'PENDING'"
                type="primary" size="small"
                @click="openPay(row)"
            >去支付</el-button>
            <el-button
                v-if="row.status === 'PENDING'"
                type="danger" size="small" plain
                @click="cancel(row.orderNo)"
            >取消</el-button>
          </div>
        </div>
      </div>

      <div class="pagination" v-if="total > 10">
        <el-pagination
            v-model:current-page="page"
            :total="total" :page-size="10"
            layout="prev, pager, next"
            @current-change="fetch"
        />
      </div>
    </div>

    <div class="empty-wrap" v-else>
      <div class="empty-icon">📋</div>
      <p class="empty-text">暂无订单</p>
      <p class="empty-sub">去游戏商城购买你喜欢的游戏吧</p>
      <router-link to="/games" class="go-shop">去买游戏 →</router-link>
    </div>
  </div>

  <PayDialog
      v-model="showPay"
      :order-no="payOrderNo"
      :amount="payAmount"
      @success="onPaid"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyOrdersApi, cancelOrderApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import PayDialog from '@/components/PayDialog.vue'

const orders  = ref([])
const loading = ref(false)
const total   = ref(0)
const page    = ref(1)
const showPay    = ref(false)
const payOrderNo = ref('')
const payAmount  = ref(0)

const statusMap = {
  PENDING:   { label: '待支付', type: 'warning' },
  PAID:      { label: '已支付', type: 'success' },
  CANCELLED: { label: '已取消', type: 'info' },
  REFUNDED:  { label: '已退款', type: 'danger' },
}

onMounted(fetch)

async function fetch() {
  loading.value = true
  try {
    const res = await getMyOrdersApi({ page: page.value - 1, size: 10 })
    orders.value = res?.content || (Array.isArray(res) ? res : [])
    total.value  = res?.totalElements || orders.value.length
  } catch (e) {
    ElMessage.error('订单加载失败，请刷新重试')
    orders.value = []
  } finally {
    loading.value = false
  }
}

function openPay(row) {
  payOrderNo.value = row.orderNo
  payAmount.value  = row.amount
  showPay.value = true
}

async function cancel(orderNo) {
  try {
    await ElMessageBox.confirm('确认取消该订单？', '提示', { type: 'warning' })
    await cancelOrderApi(orderNo)
    ElMessage.success('订单已取消')
    fetch()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('取消失败：' + (e?.message || '请重试'))
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('激活码已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function onPaid() {
  ElMessage.success('支付成功！')
  fetch()
}

function formatDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('zh-CN')
}
</script>

<style scoped>
.orders-page { max-width: 900px; margin: 0 auto; padding: 40px 24px; min-height: 60vh; }
.page-title { font-family: var(--font-display); font-size: 32px; font-weight: 700; margin-bottom: 28px; }
.loading-wrap { padding: 40px 0; }

.order-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 12px; padding: 18px 22px; margin-bottom: 14px;
  transition: border-color .2s;
}
.order-card:hover { border-color: var(--border-glow); }

.order-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.order-no { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

.order-body {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.game-name { font-size: 16px; font-weight: 600; color: var(--text-primary); display: block; }
.game-genre { font-size: 12px; color: var(--text-muted); }
.order-amount {
  font-family: var(--font-display); font-size: 22px;
  font-weight: 700; color: var(--neon-blue);
}

.cdk-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; margin-bottom: 12px;
  background: rgba(0,255,136,.05); border: 1px solid rgba(0,255,136,.2);
  border-radius: 8px;
}
.cdk-label { font-size: 11px; color: var(--neon-green); font-weight: 600; white-space: nowrap; }
.cdk-code {
  flex: 1; font-family: var(--font-mono); font-size: 15px;
  font-weight: 700; color: var(--neon-green); letter-spacing: 1px;
  word-break: break-all;
}
.copy-btn {
  padding: 4px 12px; border-radius: 6px; font-size: 12px;
  background: transparent; border: 1px solid rgba(0,255,136,.3);
  color: var(--neon-green); cursor: pointer; white-space: nowrap;
  transition: all .2s;
}
.copy-btn:hover { background: rgba(0,255,136,.1); }

.order-footer {
  display: flex; justify-content: space-between; align-items: center;
}
.order-time { font-size: 12px; color: var(--text-muted); }
.order-actions { display: flex; gap: 8px; }

.pagination { margin-top: 24px; display: flex; justify-content: center; }

.empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 100px 0; gap: 12px; text-align: center;
}
.empty-icon { font-size: 60px; opacity: .3; }
.empty-text { font-family: var(--font-display); font-size: 22px; color: var(--text-secondary); }
.empty-sub  { font-size: 14px; color: var(--text-muted); }
.go-shop {
  margin-top: 8px; padding: 12px 28px; display: inline-block;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  color: white; border-radius: 10px; text-decoration: none;
  font-weight: 700; transition: all .2s;
}
.go-shop:hover { box-shadow: var(--glow-blue); transform: translateY(-1px); }
</style>