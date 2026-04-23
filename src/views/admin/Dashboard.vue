<template>
  <div class="admin-dash">
    <h2 class="dash-title">系统总览</h2>

    <div class="stats-grid" v-loading="loading">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-glow" :style="{ background: s.color + '22' }"></div>
        <div class="stat-icon">{{ s.icon }}</div>
        <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <div class="charts-row">
      <div class="panel">
        <h3>快速操作</h3>
        <div class="quick-ops">
          <router-link to="/admin/users" class="op-btn">👥 用户管理</router-link>
          <router-link to="/admin/games" class="op-btn">🎮 游戏审核</router-link>
          <router-link to="/admin/orders" class="op-btn">📋 订单列表</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDashboardStatsApi } from '@/api'

const stats = ref({})
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try { stats.value = await getDashboardStatsApi() }
  finally { loading.value = false }
})

const statCards = computed(() => [
  { icon: '👥', label: '注册用户', value: stats.value.totalUsers ?? '—', color: 'var(--neon-blue)' },
  { icon: '🏪', label: '入驻商户', value: stats.value.totalMerchants ?? '—', color: 'var(--neon-purple)' },
  { icon: '🎮', label: '在售游戏', value: stats.value.totalGames ?? '—', color: 'var(--neon-cyan)' },
  { icon: '🛒', label: '成交订单', value: stats.value.totalOrders ?? '—', color: 'var(--neon-green)' },
  { icon: '💰', label: '平台收益', value: stats.value.totalRevenue ? `¥${Number(stats.value.totalRevenue).toFixed(0)}` : '¥0', color: 'var(--gold)' },
])
</script>

<style scoped>
.admin-dash {}
.dash-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; margin-bottom: 24px; }
.stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 24px; }
.stat-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px; text-align: center; position: relative; overflow: hidden;
}
.stat-glow { position: absolute; inset: 0; pointer-events: none; }
.stat-icon { font-size: 28px; margin-bottom: 8px; }
.stat-value { font-family: var(--font-display); font-size: 28px; font-weight: 700; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: var(--text-muted); }

.panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.panel h3 { font-family: var(--font-display); margin-bottom: 16px; }
.quick-ops { display: flex; gap: 12px; }
.op-btn {
  padding: 12px 20px; border-radius: 8px; border: 1px solid var(--border);
  color: var(--text-secondary); text-decoration: none; font-size: 14px; transition: all .2s;
}
.op-btn:hover { border-color: var(--neon-pink); color: var(--neon-pink); }
</style>
