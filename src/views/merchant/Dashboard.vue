<template>
  <div class="dashboard">
    <h2 class="dash-title">数据总览</h2>
    <div class="stats-grid">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-icon" :style="{ color: s.color }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <div class="panel-row">
      <div class="panel">
        <h3>最近上架游戏</h3>
        <div class="mini-list">
          <div class="mini-item" v-for="g in recentGames" :key="g.id">
            <span class="mini-name">{{ g.name }}</span>
            <span class="mini-price">¥{{ g.price }}</span>
            <el-tag size="small" :type="g.status === 'ON_SALE' ? 'success' : 'info'">
              {{ g.status === 'ON_SALE' ? '在售' : '下架' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getMyGamesApi } from '@/api'

const myGames = ref([])
onMounted(async () => {
  const res = await getMyGamesApi({ page: 0, size: 50 })
  myGames.value = res.content || res
})

const recentGames = computed(() => myGames.value.slice(0, 6))
const onSale  = computed(() => myGames.value.filter(g => g.status === 'ON_SALE').length)
const revenue = computed(() => myGames.value.reduce((s, g) => s + (g.soldCount || 0) * g.price, 0).toFixed(0))
const totalSold = computed(() => myGames.value.reduce((s, g) => s + (g.soldCount || 0), 0))

const statCards = computed(() => [
  { icon: '🎮', label: '在售游戏', value: onSale.value, color: 'var(--neon-blue)' },
  { icon: '📦', label: '总上架', value: myGames.value.length, color: 'var(--neon-purple)' },
  { icon: '🛒', label: '累计销量', value: totalSold.value, color: 'var(--neon-green)' },
  { icon: '💰', label: '预估收益', value: `¥${revenue.value}`, color: 'var(--gold)' },
])
</script>

<style scoped>
.dashboard { }
.dash-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; margin-bottom: 24px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px;
}
.stat-icon { font-size: 32px; }
.stat-value { font-family: var(--font-display); font-size: 26px; font-weight: 700; }
.stat-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.panel h3 { font-family: var(--font-display); margin-bottom: 16px; }
.mini-list { display: flex; flex-direction: column; gap: 10px; }
.mini-item { display: flex; align-items: center; gap: 12px; font-size: 14px; }
.mini-name { flex: 1; color: var(--text-secondary); }
.mini-price { color: var(--neon-blue); font-family: var(--font-display); }
</style>
