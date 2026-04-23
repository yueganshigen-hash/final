<template>
  <div class="profile-page">
    <h1 class="page-title">👤 个人中心</h1>

    <div class="profile-wrap">
      <!-- 用户信息卡 -->
      <div class="info-card">
        <div class="avatar-row">
          <el-avatar :size="72" class="avatar">
            {{ userInfo?.username?.[0]?.toUpperCase() || '?' }}
          </el-avatar>
          <div>
            <div class="username">{{ userInfo?.username }}</div>
            <el-tag :type="roleMap[userInfo?.role]?.type" size="small" style="margin-top:6px">
              {{ roleMap[userInfo?.role]?.label || userInfo?.role }}
            </el-tag>
          </div>
        </div>

        <div class="info-list">
          <div class="info-row">
            <span class="info-key">邮箱</span>
            <span class="info-val">{{ userInfo?.email || '—' }}</span>
          </div>
          <div class="info-row" v-if="userInfo?.shopName">
            <span class="info-key">店铺</span>
            <span class="info-val">{{ userInfo.shopName }}</span>
          </div>
          <div class="info-row">
            <span class="info-key">账户余额</span>
            <span class="info-val balance">¥{{ userInfo?.balance || '0.00' }}</span>
          </div>
        </div>
      </div>

      <!-- 快捷导航 -->
      <div class="nav-card">
        <h3>快捷导航</h3>
        <div class="nav-grid">
          <router-link to="/orders" class="nav-item">
            <span class="nav-icon">📋</span>
            <span>我的订单</span>
          </router-link>
          <router-link to="/cdk" class="nav-item">
            <span class="nav-icon">🔑</span>
            <span>我的CDK</span>
          </router-link>
          <router-link to="/cart" class="nav-item">
            <span class="nav-icon">🛒</span>
            <span>购物车</span>
          </router-link>
          <router-link to="/games" class="nav-item">
            <span class="nav-icon">🎮</span>
            <span>游戏商城</span>
          </router-link>
          <router-link to="/merchant" class="nav-item merchant" v-if="auth.isMerchant">
            <span class="nav-icon">🏪</span>
            <span>商户后台</span>
          </router-link>
          <router-link to="/admin" class="nav-item admin" v-if="auth.isAdmin">
            <span class="nav-icon">⚙</span>
            <span>管理后台</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const userInfo = computed(() => auth.user || {})

const roleMap = {
  USER:     { label: '普通玩家', type: '' },
  MERCHANT: { label: '商户',    type: 'warning' },
  ADMIN:    { label: '管理员',  type: 'danger' },
}
</script>

<style scoped>
.profile-page { max-width: 800px; margin: 0 auto; padding: 40px 24px; min-height: 60vh; }
.page-title { font-family: var(--font-display); font-size: 32px; font-weight: 700; margin-bottom: 28px; }

.profile-wrap { display: flex; flex-direction: column; gap: 20px; }

.info-card, .nav-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 24px;
}

.avatar-row { display: flex; align-items: center; gap: 18px; margin-bottom: 22px; }
.avatar { background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); font-size: 26px; }
.username { font-family: var(--font-display); font-size: 22px; font-weight: 700; }

.info-list { display: flex; flex-direction: column; gap: 0; }
.info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-bottom: 1px solid var(--border);
}
.info-row:last-child { border-bottom: none; }
.info-key { font-size: 13px; color: var(--text-muted); }
.info-val { font-size: 14px; color: var(--text-secondary); }
.info-val.balance { font-family: var(--font-display); font-size: 18px; color: var(--neon-blue); font-weight: 700; }

.nav-card h3 { font-family: var(--font-display); font-size: 18px; margin-bottom: 16px; }
.nav-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

.nav-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 18px 12px; border-radius: 10px;
  border: 1px solid var(--border); text-decoration: none;
  color: var(--text-secondary); font-size: 13px; transition: all .2s;
}
.nav-item:hover { border-color: var(--neon-blue); color: var(--neon-blue); background: rgba(77,127,255,.06); }
.nav-item.merchant:hover { border-color: var(--neon-purple); color: var(--neon-purple); background: rgba(168,85,247,.06); }
.nav-item.admin:hover    { border-color: var(--neon-pink); color: var(--neon-pink); background: rgba(255,45,120,.06); }
.nav-icon { font-size: 28px; }
</style>