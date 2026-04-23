<template>
  <div class="user-layout">
    <nav class="navbar">
      <div class="nav-inner">
        <router-link to="/" class="logo">
          <span class="logo-icon">⬡</span>
          GAME<span class="neon-text">NEXUS</span>
        </router-link>

        <div class="nav-center">
          <router-link to="/"      class="nav-link" :class="{ active: $route.path === '/' }">首页</router-link>
          <router-link to="/games" class="nav-link" :class="{ active: $route.path.startsWith('/games') }">游戏商城</router-link>
        </div>

        <div class="nav-search">
          <el-input v-model="searchKw" placeholder="搜索游戏..." size="small" clearable @keyup.enter="doSearch">
            <template #suffix>
              <el-icon style="cursor:pointer" @click="doSearch"><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="nav-right">
          <router-link to="/cart" class="nav-icon-btn" v-if="auth.isLoggedIn">
            <el-badge :value="cartStore.count || ''" :hidden="!cartStore.count" type="danger">
              <el-icon :size="20"><ShoppingCart /></el-icon>
            </el-badge>
          </router-link>

          <el-dropdown v-if="auth.isLoggedIn" @command="handleCommand" trigger="click">
            <div class="user-avatar">
              <el-avatar :size="30" style="background:linear-gradient(135deg,var(--neon-blue),var(--neon-purple));font-size:13px">
                {{ auth.user?.username?.[0]?.toUpperCase() }}
              </el-avatar>
              <span class="username">{{ auth.user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">👤 个人中心</el-dropdown-item>
                <el-dropdown-item command="orders">📋 我的订单</el-dropdown-item>
                <el-dropdown-item command="cdk">🔑 我的CDK</el-dropdown-item>
                <el-dropdown-item divided command="merchant" v-if="auth.isMerchant">🏪 商户后台</el-dropdown-item>
                <el-dropdown-item command="admin" v-if="auth.isAdmin">⚙ 管理后台</el-dropdown-item>
                <el-dropdown-item divided command="logout" style="color:var(--neon-pink)">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <template v-else>
            <router-link to="/login"    class="nav-btn outline">登录</router-link>
            <router-link to="/register" class="nav-btn primary">注册</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- 不用 transition，直接渲染，避免动画导致黑屏 -->
    <main class="main-content">
      <router-view :key="$route.fullPath" />
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-logo">GAME<span class="neon-text">NEXUS</span> © 2024</span>
        <span class="footer-sub">次世代游戏电商平台</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { ElMessageBox } from 'element-plus'

const router    = useRouter()
const route     = useRoute()
const auth      = useAuthStore()
const cartStore = useCartStore()
const searchKw  = ref('')

onMounted(() => {
  if (auth.isLoggedIn) cartStore.fetchCart().catch(() => {})
})

function doSearch() {
  const kw = searchKw.value.trim()
  if (kw) router.push({ path: '/games', query: { keyword: kw } })
}

async function handleCommand(cmd) {
  try {
    if (cmd === 'logout') {
      await ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
      auth.logout()
      router.push('/login')
    } else if (cmd === 'merchant') {
      router.push('/merchant')
    } else if (cmd === 'admin') {
      router.push('/admin')
    } else {
      router.push('/' + cmd)
    }
  } catch (e) {
    // 用户点取消，忽略
  }
}
</script>

<style scoped>
.user-layout { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg-void); }

.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,18,.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  height: 64px; display: flex; align-items: center; gap: 20px;
}
.logo {
  font-family: var(--font-display); font-size: 18px; font-weight: 700;
  letter-spacing: 3px; color: var(--text-primary); text-decoration: none; white-space: nowrap;
}
.logo-icon { color: var(--neon-blue); margin-right: 6px; filter: drop-shadow(0 0 6px var(--neon-blue)); }

.nav-center { display: flex; gap: 4px; }
.nav-link {
  padding: 6px 14px; border-radius: 6px; color: var(--text-secondary);
  text-decoration: none; font-size: 14px; transition: all .2s;
}
.nav-link:hover, .nav-link.active { color: var(--neon-blue); background: rgba(77,127,255,.08); }

.nav-search { flex: 1; max-width: 220px; }
.nav-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }

.nav-icon-btn {
  color: var(--text-secondary); display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 8px; transition: all .2s; text-decoration: none;
}
.nav-icon-btn:hover { color: var(--neon-blue); background: rgba(77,127,255,.08); }

.user-avatar {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 4px 8px; border-radius: 8px; transition: background .2s;
}
.user-avatar:hover { background: var(--bg-hover); }
.username {
  font-size: 13px; color: var(--text-secondary);
  max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.nav-btn {
  padding: 6px 16px; border-radius: 6px; font-size: 13px;
  text-decoration: none; transition: all .2s; white-space: nowrap;
}
.nav-btn.outline { border: 1px solid var(--border); color: var(--text-secondary); }
.nav-btn.outline:hover { border-color: var(--neon-blue); color: var(--neon-blue); }
.nav-btn.primary { background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); color: white; border: none; }
.nav-btn.primary:hover { box-shadow: var(--glow-blue); }

.main-content { flex: 1; }

.footer { border-top: 1px solid var(--border); background: var(--bg-deep); padding: 20px 24px; }
.footer-inner {
  max-width: 1280px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-logo { font-family: var(--font-display); font-size: 14px; letter-spacing: 2px; }
.footer-sub  { font-size: 12px; color: var(--text-muted); }

:deep(.el-dropdown-menu) { background: var(--bg-card) !important; border: 1px solid var(--border) !important; }
:deep(.el-dropdown-menu__item) { color: var(--text-secondary) !important; }
:deep(.el-dropdown-menu__item:hover) { background: var(--bg-hover) !important; color: var(--neon-blue) !important; }
</style>