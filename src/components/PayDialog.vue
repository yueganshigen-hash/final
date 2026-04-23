<template>
  <el-dialog
      v-model="visible"
      :title="titles[step]"
      width="420px"
      :close-on-click-modal="step !== 'paying'"
      :show-close="step !== 'paying'"
      append-to-body
      destroy-on-close
      @close="handleClose"
      @closed="onClosed"
  >
    <!-- 选择支付方式 -->
    <div v-if="step === 'select'" class="pay-select">
      <div class="order-row">
        <span class="label">订单编号</span>
        <span class="value mono">{{ orderNo }}</span>
      </div>
      <div class="order-row">
        <span class="label">支付金额</span>
        <span class="amount">¥ {{ amount }}</span>
      </div>

      <div class="pay-methods">
        <div
            v-for="m in methods" :key="m.value"
            :class="['method-item', payMethod === m.value && 'active']"
            @click="payMethod = m.value"
        >
          <span class="method-icon">{{ m.icon }}</span>
          <span class="method-name">{{ m.label }}</span>
          <el-icon class="check" v-if="payMethod === m.value"><CircleCheckFilled /></el-icon>
        </div>
      </div>

      <button class="pay-btn" @click="startPay">
        确认支付 ¥{{ amount }}
      </button>
    </div>

    <!-- 支付处理中 -->
    <div v-else-if="step === 'paying'" class="pay-loading">
      <div class="loading-ring">
        <svg viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" class="track" />
          <circle cx="40" cy="40" r="34" class="prog"
                  :style="{ strokeDashoffset: dashOffset }" />
        </svg>
        <span class="pct">{{ progress }}%</span>
      </div>
      <p class="paying-text">正在处理支付请求</p>
      <p class="paying-sub">请勿关闭页面（{{ countdown }}s）</p>
    </div>

    <!-- 支付成功 + CDK -->
    <div v-else-if="step === 'success'" class="pay-success">
      <div class="success-ring">✓</div>
      <h3>支付成功！</h3>
      <p class="success-sub">您的游戏激活码已发放</p>

      <div class="cdk-block">
        <div class="cdk-header">
          <span class="cdk-label">激活码 (CDK)</span>
          <button class="copy-btn" @click="copyCdk">
            <el-icon><CopyDocument /></el-icon> 复制
          </button>
        </div>
        <div class="cdk-code">{{ cdkCode }}</div>
        <p class="cdk-tip">⚠ 请妥善保管，后续可在「我的订单」中查看</p>
      </div>

      <div class="success-actions">
        <button class="btn-ghost" @click="goOrders">查看订单</button>
        <button class="btn-primary" @click="handleClose">完成</button>
      </div>
    </div>

    <!-- 支付失败 -->
    <div v-else-if="step === 'fail'" class="pay-fail">
      <div class="fail-icon">✕</div>
      <h3>支付失败</h3>
      <p class="fail-msg">{{ failMsg }}</p>
      <button class="btn-primary" @click="step = 'select'">重新尝试</button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { payOrderApi } from '@/api'

const props = defineProps({
  modelValue: Boolean,
  orderNo:    String,
  amount:     [String, Number],
})
const emit = defineEmits(['update:modelValue', 'success'])

const router    = useRouter()
const visible   = ref(false)
const step      = ref('select')
const payMethod = ref('alipay')
const cdkCode   = ref('')
const failMsg   = ref('')
const countdown = ref(3)
const progress  = ref(0)
let   timer     = null

const titles = {
  select:  '收银台',
  paying:  '处理中...',
  success: '支付完成',
  fail:    '支付失败',
}

const methods = [
  { value: 'alipay',  icon: '💙', label: '支付宝' },
  { value: 'wechat',  icon: '💚', label: '微信支付' },
  { value: 'balance', icon: '💛', label: '余额支付' },
]

const circumference = 2 * Math.PI * 34
const dashOffset = computed(() =>
    circumference * (1 - progress.value / 100)
)

// 同步外部 v-model
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) resetState()
})
watch(visible, (val) => emit('update:modelValue', val))

function resetState() {
  step.value      = 'select'
  payMethod.value = 'alipay'
  cdkCode.value   = ''
  failMsg.value   = ''
  progress.value  = 0
  countdown.value = 3
  stopTimer()
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 页面卸载时必须清理 timer，否则切换路由崩溃
onUnmounted(() => {
  stopTimer()
})

async function startPay() {
  step.value      = 'paying'
  countdown.value = 3
  progress.value  = 0
  let elapsed     = 0

  stopTimer()
  timer = setInterval(() => {
    elapsed        += 50
    progress.value  = Math.min(Math.round((elapsed / 3000) * 100), 99)
    countdown.value = Math.max(Math.ceil((3000 - elapsed) / 1000), 0)
    if (elapsed >= 3000) {
      stopTimer()
      callApi()
    }
  }, 50)
}

async function callApi() {
  try {
    const data    = await payOrderApi(props.orderNo)
    cdkCode.value = data.cdkCode || data.cdk_code || '获取失败'
    progress.value = 100
    step.value    = 'success'
    emit('success', { orderNo: props.orderNo, cdkCode: cdkCode.value })
  } catch (e) {
    failMsg.value = e?.message || '网络异常，请重试'
    step.value    = 'fail'
  }
}

async function copyCdk() {
  try {
    await navigator.clipboard.writeText(cdkCode.value)
    ElMessage.success('激活码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function goOrders() {
  handleClose()
  router.push('/orders')
}

function handleClose() {
  if (step.value === 'paying') return
  stopTimer()
  visible.value = false
}

// 弹窗完全关闭后重置状态（destroy-on-close 触发）
function onClosed() {
  resetState()
}
</script>

<style scoped>
.pay-select { display: flex; flex-direction: column; gap: 0; }

.order-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid var(--border);
}
.label  { font-size: 13px; color: var(--text-muted); }
.value.mono { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); word-break: break-all; }
.amount { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--neon-pink); }

.pay-methods { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
.method-item {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border-radius: 8px; border: 1px solid var(--border); cursor: pointer;
  transition: all .2s; position: relative;
}
.method-item.active { border-color: var(--neon-blue); background: rgba(77,127,255,.08); }
.method-icon { font-size: 20px; }
.method-name { font-size: 14px; color: var(--text-primary); }
.check { position: absolute; right: 14px; color: var(--neon-blue); }

.pay-btn {
  width: 100%; padding: 14px; margin-top: 4px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  border: none; border-radius: 8px; color: white;
  font-size: 16px; font-weight: 600; cursor: pointer;
  font-family: var(--font-display); letter-spacing: 1px; transition: all .2s;
}
.pay-btn:hover { box-shadow: var(--glow-blue); transform: translateY(-1px); }

/* 支付中 */
.pay-loading {
  display: flex; flex-direction: column; align-items: center;
  padding: 24px 0 12px; gap: 16px;
}
.loading-ring { position: relative; width: 80px; height: 80px; }
.loading-ring svg { width: 80px; height: 80px; transform: rotate(-90deg); }
.track { fill: none; stroke: var(--bg-deep); stroke-width: 6; }
.prog {
  fill: none; stroke: var(--neon-blue); stroke-width: 6; stroke-linecap: round;
  stroke-dasharray: 213.6; transition: stroke-dashoffset .08s linear;
  filter: drop-shadow(0 0 6px var(--neon-blue));
}
.pct {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: var(--font-mono); font-size: 14px; color: var(--neon-blue);
}
.paying-text { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.paying-sub  { font-size: 13px; color: var(--text-muted); }

/* 支付成功 */
.pay-success {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 8px 0;
}
.success-ring {
  width: 64px; height: 64px; border-radius: 50%;
  border: 2px solid var(--neon-green); color: var(--neon-green);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: bold;
  box-shadow: 0 0 20px rgba(0,255,136,.3);
}
.pay-success h3 { font-size: 20px; font-family: var(--font-display); color: var(--text-primary); }
.success-sub { color: var(--text-muted); font-size: 13px; }

.cdk-block {
  width: 100%; background: rgba(0,255,136,.05);
  border: 1px solid rgba(0,255,136,.25); border-radius: 10px; padding: 14px;
}
.cdk-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.cdk-label  { font-size: 11px; color: var(--neon-green); letter-spacing: 1px; font-weight: 700; }
.copy-btn {
  display: flex; align-items: center; gap: 4px; padding: 4px 10px;
  background: transparent; border: 1px solid rgba(0,255,136,.3);
  border-radius: 4px; color: var(--neon-green); cursor: pointer; font-size: 12px;
  transition: all .2s;
}
.copy-btn:hover { background: rgba(0,255,136,.1); }
.cdk-code {
  font-family: var(--font-mono); font-size: 17px; font-weight: bold;
  color: var(--neon-green); letter-spacing: 2px; text-align: center;
  padding: 8px 0; word-break: break-all;
}
.cdk-tip { font-size: 11px; color: var(--text-muted); margin-top: 8px; }

.success-actions { display: flex; gap: 10px; width: 100%; }

/* 支付失败 */
.pay-fail {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 8px 0;
}
.fail-icon {
  width: 64px; height: 64px; border-radius: 50%;
  border: 2px solid var(--neon-pink); color: var(--neon-pink);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; box-shadow: 0 0 20px rgba(255,45,120,.3);
}
.pay-fail h3 { font-size: 20px; font-family: var(--font-display); color: var(--text-primary); }
.fail-msg { color: var(--text-muted); font-size: 13px; text-align: center; }

/* 通用按钮 */
.btn-ghost, .btn-primary {
  flex: 1; padding: 10px; border-radius: 8px;
  cursor: pointer; font-size: 14px; transition: all .2s; font-family: var(--font-body);
}
.btn-ghost {
  background: transparent; border: 1px solid var(--border); color: var(--text-secondary);
}
.btn-ghost:hover { border-color: var(--neon-blue); color: var(--neon-blue); }
.btn-primary {
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  border: none; color: white; font-weight: 600;
}
.btn-primary:hover { box-shadow: var(--glow-blue); }
</style>