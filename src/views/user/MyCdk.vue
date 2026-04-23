<template>
  <div class="cdk-page">
    <h1 class="page-title">🔑 我的激活码</h1>

    <div class="loading-wrap" v-if="loading">
      <el-skeleton :rows="4" animated />
    </div>

    <div v-else-if="cdkList.length > 0">
      <div class="cdk-card" v-for="item in cdkList" :key="item.id">
        <div class="cdk-left">
          <div class="game-name">{{ item.game?.name || '未知游戏' }}</div>
          <div class="order-no">订单号：{{ item.orderNo }}</div>
          <div class="used-at">领取时间：{{ formatDate(item.usedAt) }}</div>
        </div>
        <div class="cdk-right">
          <div class="cdk-code">{{ item.code }}</div>
          <button class="copy-btn" @click="copy(item.code)">
            <el-icon><CopyDocument /></el-icon> 复制
          </button>
        </div>
      </div>
    </div>

    <div class="empty-wrap" v-else>
      <div class="empty-icon">🔑</div>
      <p class="empty-text">暂无激活码</p>
      <p class="empty-sub">购买游戏后激活码会自动出现在这里</p>
      <router-link to="/games" class="go-shop">去买游戏 →</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyCdkApi } from '@/api'
import { ElMessage } from 'element-plus'

const cdkList = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getMyCdkApi()
    cdkList.value = Array.isArray(res) ? res : []
  } catch (e) {
    ElMessage.error('加载失败，请刷新重试')
    cdkList.value = []
  } finally {
    loading.value = false
  }
})

async function copy(code) {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('激活码已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function formatDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('zh-CN')
}
</script>

<style scoped>
.cdk-page { max-width: 900px; margin: 0 auto; padding: 40px 24px; min-height: 60vh; }
.page-title { font-family: var(--font-display); font-size: 32px; font-weight: 700; margin-bottom: 28px; }
.loading-wrap { padding: 40px 0; }

.cdk-card {
  display: flex; justify-content: space-between; align-items: center;
  gap: 20px; padding: 20px 24px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
  margin-bottom: 12px; transition: border-color .2s;
}
.cdk-card:hover { border-color: var(--neon-green); }

.cdk-left { flex: 1; min-width: 0; }
.game-name { font-weight: 600; font-size: 16px; color: var(--text-primary); margin-bottom: 4px; }
.order-no { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
.used-at  { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.cdk-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.cdk-code {
  font-family: var(--font-mono); font-size: 18px; font-weight: 700;
  color: var(--neon-green); letter-spacing: 2px;
  background: rgba(0,255,136,.05); border: 1px solid rgba(0,255,136,.2);
  padding: 8px 16px; border-radius: 8px;
}
.copy-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px;
  background: transparent; border: 1px solid rgba(0,255,136,.3);
  color: var(--neon-green); cursor: pointer; font-size: 13px; transition: all .2s;
}
.copy-btn:hover { background: rgba(0,255,136,.08); }

.empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 100px 0; gap: 12px; text-align: center;
}
.empty-icon { font-size: 60px; opacity: .3; }
.empty-text { font-family: var(--font-display); font-size: 22px; color: var(--text-secondary); }
.empty-sub  { font-size: 14px; color: var(--text-muted); }
.go-shop {
  margin-top: 8px; padding: 12px 28px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  color: white; border-radius: 10px; text-decoration: none; font-weight: 700;
  transition: all .2s; display: inline-block;
}
.go-shop:hover { box-shadow: var(--glow-blue); transform: translateY(-1px); }
</style>