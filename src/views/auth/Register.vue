<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">GAME<span class="neon-text">NEXUS</span></div>
      <h2 class="auth-title">创建账号</h2>

      <div class="form">
        <!-- 用户名 -->
        <div class="field">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="3-20个字符" class="input" />
        </div>

        <!-- 邮箱 + 验证码按钮 -->
        <div class="field">
          <label>邮箱</label>
          <div class="email-row">
            <input v-model="form.email" type="email" placeholder="your@email.com" class="input" />
            <button
                class="code-btn"
                :disabled="codeSending || countdown > 0"
                @click="sendCode"
            >
              <span v-if="codeSending">发送中...</span>
              <span v-else-if="countdown > 0">{{ countdown }}s 后重试</span>
              <span v-else>获取验证码</span>
            </button>
          </div>
        </div>

        <!-- 验证码输入 -->
        <div class="field">
          <label>邮箱验证码</label>
          <input v-model="form.emailCode" type="text" placeholder="请输入6位验证码" class="input" maxlength="6" />
        </div>

        <!-- 密码 -->
        <div class="field">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="至少6位" class="input" />
        </div>

        <!-- 角色 -->
        <div class="field">
          <label>注册身份</label>
          <div class="role-tabs">
            <button :class="['role-tab', form.role === 'USER' && 'active']"     @click="form.role = 'USER'">🎮 普通玩家</button>
            <button :class="['role-tab', form.role === 'MERCHANT' && 'active']" @click="form.role = 'MERCHANT'">🏪 游戏商户</button>
          </div>
        </div>

        <!-- 商户专属字段 -->
        <div class="field" v-if="form.role === 'MERCHANT'">
          <label>店铺名称</label>
          <input v-model="form.shopName" type="text" placeholder="你的游戏店铺名" class="input" />
        </div>

        <button class="submit-btn" @click="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <p class="switch-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router  = useRouter()
const auth    = useAuthStore()
const loading     = ref(false)
const codeSending = ref(false)
const countdown   = ref(0)

const form = reactive({
  username:  '',
  email:     '',
  emailCode: '',
  password:  '',
  role:      'USER',
  shopName:  '',
})

let timer = null

async function sendCode() {
  if (!form.email || !/^[\w.%+\-]+@[\w.\-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
    ElMessage.warning('请先输入正确的邮箱地址')
    return
  }
  codeSending.value = true
  try {
    const res = await axios.post('/api/email/code', { email: form.email })
    // 后端统一返回 {code, message, data}
    const body = res.data
    if (body.code === 200) {
      ElMessage.success('验证码已发送，请查收邮件')
      startCountdown()
    } else {
      ElMessage.error(body.message || '发送失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '发送失败，请重试')
  } finally {
    codeSending.value = false
  }
}

function startCountdown() {
  countdown.value = 60
  clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function submit() {
  if (!form.username.trim()) return ElMessage.warning('请输入用户名')
  if (!form.email.trim())    return ElMessage.warning('请输入邮箱')
  if (!form.emailCode.trim()) return ElMessage.warning('请输入邮箱验证码')
  if (!form.password.trim()) return ElMessage.warning('请输入密码')
  if (form.password.length < 6) return ElMessage.warning('密码至少6位')
  if (form.role === 'MERCHANT' && !form.shopName.trim()) return ElMessage.warning('请输入店铺名称')

  loading.value = true
  try {
    await auth.register({
      username:  form.username,
      email:     form.email,
      emailCode: form.emailCode,
      password:  form.password,
      role:      form.role,
      shopName:  form.shopName || undefined,
    })
    ElMessage.success('注册成功，欢迎加入！')
    const role = auth.user?.role
    if (role === 'MERCHANT') router.push('/merchant')
    else router.push('/')
  } catch (e) {
    // error shown by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg-void); padding: 24px;
}
.auth-card {
  width: 100%; max-width: 420px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 36px 32px;
}
.auth-logo {
  font-family: var(--font-display); font-size: 22px; font-weight: 700;
  letter-spacing: 4px; text-align: center; margin-bottom: 8px;
}
.auth-title {
  font-family: var(--font-display); font-size: 20px; font-weight: 600;
  text-align: center; color: var(--text-secondary); margin-bottom: 28px;
}

.form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; color: var(--text-muted); }

.input {
  width: 100%; padding: 10px 14px; box-sizing: border-box;
  background: var(--bg-deep); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text-primary); font-size: 14px;
  transition: border-color .2s; outline: none; font-family: var(--font-body);
}
.input:focus { border-color: var(--neon-blue); }
.input::placeholder { color: var(--text-muted); }

/* 邮箱行 */
.email-row { display: flex; gap: 8px; }
.email-row .input { flex: 1; }
.code-btn {
  flex-shrink: 0; padding: 10px 14px; white-space: nowrap;
  background: transparent; border: 1px solid var(--neon-blue);
  color: var(--neon-blue); border-radius: 8px; cursor: pointer;
  font-size: 13px; transition: all .2s; font-family: var(--font-body);
}
.code-btn:hover:not(:disabled) { background: rgba(77,127,255,.1); }
.code-btn:disabled { opacity: .5; cursor: not-allowed; }

/* 角色选择 */
.role-tabs { display: flex; gap: 8px; }
.role-tab {
  flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); cursor: pointer;
  font-size: 13px; transition: all .2s; font-family: var(--font-body);
}
.role-tab.active { border-color: var(--neon-blue); color: var(--neon-blue); background: rgba(77,127,255,.08); }

.submit-btn {
  width: 100%; padding: 13px; margin-top: 4px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  border: none; border-radius: 10px; color: white;
  font-size: 16px; font-weight: 700; cursor: pointer;
  font-family: var(--font-display); letter-spacing: 1px; transition: all .2s;
}
.submit-btn:hover:not(:disabled) { box-shadow: var(--glow-blue); transform: translateY(-1px); }
.submit-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.switch-link { text-align: center; font-size: 13px; color: var(--text-muted); }
.switch-link a { color: var(--neon-blue); text-decoration: none; }
.switch-link a:hover { text-decoration: underline; }
</style>