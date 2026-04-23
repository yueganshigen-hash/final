<template>
  <div class="dash-layout">
    <aside class="sidebar admin-sidebar">
      <div class="sidebar-logo">
        <span>⬡</span> 管理后台
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" exact class="nav-item" active-class="active">
          <el-icon><DataAnalysis /></el-icon> 系统总览
        </router-link>
        <router-link to="/admin/users" class="nav-item" active-class="active">
          <el-icon><User /></el-icon> 用户管理
        </router-link>
        <router-link to="/admin/games" class="nav-item" active-class="active">
          <el-icon><Grid /></el-icon> 游戏管理
        </router-link>
        <router-link to="/admin/orders" class="nav-item" active-class="active">
          <el-icon><List /></el-icon> 订单管理
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="back-link">← 返回商城</router-link>
        <button class="logout-btn" @click="logout">退出登录</button>
      </div>
    </aside>

    <div class="main">
      <header class="dash-header">
        <span class="page-hint admin-hint">⚙ 系统管理员</span>
        <div class="header-right">
          <el-avatar :size="32" style="background:var(--neon-pink)">A</el-avatar>
          <span>{{ auth.user?.username }}</span>
        </div>
      </header>
      <div class="content"><router-view /></div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
const auth = useAuthStore()
const router = useRouter()
function logout() { auth.logout(); router.push('/login') }
</script>

<style scoped>
.dash-layout { display: flex; min-height: 100vh; }
.sidebar {
  width: 220px; flex-shrink: 0;
  background: var(--bg-deep); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh;
}
.admin-sidebar { border-right-color: rgba(255,45,120,.2); }
.sidebar-logo {
  padding: 20px; font-family: var(--font-display); font-size: 18px; font-weight: 700;
  letter-spacing: 2px; border-bottom: 1px solid var(--border); color: var(--neon-pink);
}
.sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 8px;
  color: var(--text-secondary); text-decoration: none; font-size: 14px; transition: all .2s;
}
.nav-item:hover, .nav-item.active { background: rgba(255,45,120,.08); color: var(--neon-pink); }
.sidebar-footer { padding: 16px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
.back-link { color: var(--text-muted); text-decoration: none; font-size: 13px; }
.logout-btn { background: transparent; border: 1px solid rgba(255,45,120,.3); color: var(--neon-pink); padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.main { flex: 1; display: flex; flex-direction: column; }
.dash-header {
  padding: 0 24px; height: 56px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-deep);
}
.admin-hint { color: var(--neon-pink); font-size: 13px; }
.header-right { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); }
.content { flex: 1; padding: 24px; overflow-y: auto; }
</style>
