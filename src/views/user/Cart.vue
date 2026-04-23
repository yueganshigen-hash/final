<template>
  <div class="cart-page">
    <h1 class="page-title">🛒 购物车</h1>

    <!-- 加载中 -->
    <div class="loading-wrap" v-if="loading">
      <el-skeleton :rows="4" animated />
    </div>

    <!-- 有商品 -->
    <div class="cart-wrap" v-else-if="cartStore.items.length > 0">
      <div class="cart-items">
        <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
          <img
              :src="item.game?.coverImage || defaultImg(item.game?.id)"
              class="item-img"
              @error="(e) => e.target.src = defaultImg(item.game?.id)"
          />
          <div class="item-info">
            <router-link :to="`/games/${item.game?.id}`" class="item-name">
              {{ item.game?.name || '未知游戏' }}
            </router-link>
            <span class="item-genre">{{ item.game?.genre || '' }}</span>
            <span class="item-dev">{{ item.game?.developer || '' }}</span>
          </div>
          <div class="item-price">
            <span class="price">
              ¥{{ item.game?.isFlashSale ? item.game.flashSalePrice : item.game?.price }}
            </span>
            <span class="original" v-if="item.game?.isFlashSale">¥{{ item.game?.price }}</span>
          </div>
          <button class="remove-btn" @click="remove(item.id)">
            <el-icon><Delete /></el-icon>
          </button>
        </div>
      </div>

      <div class="cart-sidebar">
        <div class="summary-card">
          <h3>订单摘要</h3>
          <div class="summary-row" v-for="item in cartStore.items" :key="item.id">
            <span class="summary-name">{{ item.game?.name }}</span>
            <span class="summary-price">¥{{ item.game?.isFlashSale ? item.game.flashSalePrice : item.game?.price }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-total">
            <span>合计</span>
            <span class="total-price">¥{{ totalAmount }}</span>
          </div>
          <button class="checkout-btn" @click="checkout" :disabled="checkingOut">
            {{ checkingOut ? '处理中...' : '立即结算' }}
          </button>
          <button class="clear-btn" @click="clearCart">清空购物车</button>
        </div>
      </div>
    </div>

    <!-- 空购物车 -->
    <div class="empty-wrap" v-else>
      <div class="empty-icon">🛒</div>
      <p class="empty-text">购物车空空如也</p>
      <p class="empty-sub">去游戏商城挑选你喜欢的游戏吧</p>
      <router-link to="/games" class="go-shop">浏览游戏商城 →</router-link>
    </div>
  </div>

  <PayDialog
      v-model="showPay"
      :order-no="pendingOrderNo"
      :amount="pendingAmount"
      @success="onPaid"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { createOrderApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import PayDialog from '@/components/PayDialog.vue'

const cartStore     = useCartStore()
const loading       = ref(false)
const checkingOut   = ref(false)
const showPay       = ref(false)
const pendingOrderNo = ref('')
const pendingAmount  = ref(0)

// 页面加载时主动拉取购物车
onMounted(async () => {
  loading.value = true
  try {
    await cartStore.fetchCart()
  } catch (e) {
    ElMessage.error('购物车加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
})

const totalAmount = computed(() => {
  return cartStore.items.reduce((sum, item) => {
    const price = item.game?.isFlashSale
        ? Number(item.game.flashSalePrice)
        : Number(item.game?.price || 0)
    return sum + price
  }, 0).toFixed(2)
})

function defaultImg(id) {
  const colors = ['#1a1a3e', '#1a2e1a', '#2e1a1a', '#1a2e2e', '#2e1a2e']
  const c = colors[(id || 0) % colors.length]
  return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="${c}" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(77,127,255,0.5)" font-size="32">⬡</text></svg>`
  )}`
}

async function remove(id) {
  await cartStore.removeFromCart(id)
  ElMessage.success('已移除')
}

async function clearCart() {
  await ElMessageBox.confirm('确认清空购物车？', '提示', { type: 'warning' })
  await cartStore.clearCart()
  ElMessage.success('已清空')
}

async function checkout() {
  if (!cartStore.items.length) return
  checkingOut.value = true
  try {
    const first = cartStore.items[0]
    const order = await createOrderApi({ gameId: first.game.id })
    pendingOrderNo.value = order.orderNo
    pendingAmount.value  = order.amount
    showPay.value = true
  } catch (e) {
    ElMessage.error('创建订单失败：' + (e?.message || '请重试'))
  } finally {
    checkingOut.value = false
  }
}

function onPaid({ cdkCode }) {
  ElMessage.success(`支付成功！激活码：${cdkCode}`)
  cartStore.fetchCart()
}
</script>

<style scoped>
.cart-page { max-width: 1100px; margin: 0 auto; padding: 40px 24px; min-height: 60vh; }
.page-title { font-family: var(--font-display); font-size: 32px; font-weight: 700; margin-bottom: 28px; }
.loading-wrap { padding: 40px 0; }
.cart-wrap { display: flex; gap: 28px; align-items: flex-start; }
.cart-items { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.cart-item {
  display: flex; align-items: center; gap: 16px; padding: 16px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; transition: border-color .2s;
}
.cart-item:hover { border-color: var(--neon-blue); }
.item-img { width: 88px; height: 55px; object-fit: cover; border-radius: 6px; flex-shrink: 0; background: var(--bg-deep); }
.item-info { flex: 1; min-width: 0; }
.item-name { display: block; color: var(--text-primary); text-decoration: none; font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-name:hover { color: var(--neon-blue); }
.item-genre { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.item-dev { display: block; font-size: 11px; color: var(--text-muted); }
.item-price { text-align: right; }
.price { display: block; font-family: var(--font-display); font-size: 20px; color: var(--neon-blue); font-weight: 700; }
.original { display: block; font-size: 12px; color: var(--text-muted); text-decoration: line-through; }
.remove-btn {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: 1px solid rgba(255,45,120,.3); border-radius: 8px;
  color: var(--neon-pink); cursor: pointer; transition: all .2s; flex-shrink: 0;
}
.remove-btn:hover { background: rgba(255,45,120,.12); border-color: var(--neon-pink); }
.cart-sidebar { width: 280px; flex-shrink: 0; }
.summary-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; position: sticky; top: 80px; }
.summary-card h3 { font-family: var(--font-display); font-size: 18px; margin-bottom: 16px; }
.summary-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; gap: 8px; }
.summary-name { font-size: 13px; color: var(--text-secondary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.summary-price { font-size: 13px; color: var(--text-secondary); flex-shrink: 0; }
.summary-divider { border: none; border-top: 1px solid var(--border); margin: 14px 0; }
.summary-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; font-weight: 600; }
.total-price { font-family: var(--font-display); font-size: 26px; color: var(--neon-blue); }
.checkout-btn {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  border: none; border-radius: 10px; color: white;
  font-size: 16px; font-weight: 700; cursor: pointer; margin-bottom: 10px;
  font-family: var(--font-display); letter-spacing: 1px; transition: all .2s;
}
.checkout-btn:hover:not(:disabled) { box-shadow: 0 0 20px rgba(77,127,255,.5); transform: translateY(-1px); }
.checkout-btn:disabled { opacity: .6; cursor: not-allowed; }
.clear-btn {
  width: 100%; padding: 10px; background: transparent;
  border: 1px solid var(--border); border-radius: 8px;
  color: var(--text-muted); cursor: pointer; font-size: 13px; transition: all .2s;
}
.clear-btn:hover { border-color: var(--neon-pink); color: var(--neon-pink); }
.empty-wrap { display: flex; flex-direction: column; align-items: center; padding: 100px 0; gap: 12px; }
.empty-icon { font-size: 64px; opacity: .3; }
.empty-text { font-family: var(--font-display); font-size: 22px; color: var(--text-secondary); }
.empty-sub { font-size: 14px; color: var(--text-muted); }
.go-shop {
  margin-top: 8px; display: inline-block; padding: 12px 28px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  color: white; border-radius: 10px; text-decoration: none; font-weight: 700; transition: all .2s;
}
.go-shop:hover { box-shadow: 0 0 20px rgba(77,127,255,.5); transform: translateY(-1px); }
</style>