<template>
  <div class="auth-wrap">
    <!-- Animated background grid -->
    <div class="grid-bg"></div>
    <div class="scan-line"></div>

    <div class="auth-card">
      <div class="brand">
        <span class="brand-icon">⬡</span>
        <span class="brand-name">GAME<span class="neon-text">NEXUS</span></span>
      </div>
      <h2 class="auth-title">玩家登入</h2>
      <p class="auth-sub">进入赛博游戏宇宙</p>

      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="submit">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large"
                    prefix-icon="Lock" show-password @keyup.enter="submit" />
        </el-form-item>

        <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="submit">
          <span>LOGIN →</span>
        </el-button>
      </el-form>

      <div class="auth-links">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
      </div>

      <!-- Demo accounts -->
      <div class="demo-accounts">
        <p class="demo-title">演示账号</p>
        <div class="demo-btns">
          <button @click="fillDemo('user')" class="demo-btn">用户账号</button>
          <button @click="fillDemo('merchant')" class="demo-btn">商户账号</button>
          <button @click="fillDemo('admin')" class="demo-btn admin">管理员</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth   = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    const res = await auth.login(form)
    ElMessage.success('登录成功，欢迎回来！')
    const role = res.user.role
    if (role === 'ADMIN') router.push('/admin')
    else if (role === 'MERCHANT') router.push('/merchant')
    else router.push('/')
  } catch (e) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

function fillDemo(type) {
  const demos = {
    user:     { username: 'demo_user', password: '123456' },
    merchant: { username: 'demo_merchant', password: '123456' },
    admin:    { username: 'admin', password: 'admin123' },
  }
  Object.assign(form, demos[type])
}
</script>

<style scoped>
.auth-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--bg-void);
}

.grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(77,127,255,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(77,127,255,.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.scan-line {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-blue), transparent);
  animation: scan 4s linear infinite;
  opacity: .3;
  pointer-events: none;
}

.auth-card {
  width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 60px rgba(77,127,255,.1), inset 0 1px 0 rgba(255,255,255,.05);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
}
.brand-icon {
  font-size: 28px;
  color: var(--neon-blue);
  filter: drop-shadow(0 0 8px var(--neon-blue));
}
.brand-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--text-primary);
}

.auth-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.auth-sub {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 28px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  letter-spacing: 3px;
  margin-top: 8px;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}
.auth-links a {
  color: var(--neon-blue);
  text-decoration: none;
  margin-left: 4px;
}
.auth-links a:hover { text-decoration: underline; }

.demo-accounts {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.demo-title {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.demo-btns { display: flex; gap: 8px; justify-content: center; }
.demo-btn {
  padding: 6px 14px;
  font-size: 12px;
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all .2s;
  font-family: var(--font-body);
}
.demo-btn:hover { border-color: var(--neon-blue); color: var(--neon-blue); }
.demo-btn.admin:hover { border-color: var(--neon-pink); color: var(--neon-pink); }
</style>
