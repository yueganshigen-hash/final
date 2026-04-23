<template>
  <div class="game-detail-page">
    <!-- 加载中 -->
    <div class="loading-wrap" v-if="loading">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 游戏不存在 -->
    <div class="empty-wrap" v-else-if="!game">
      <div class="empty-icon">🎮</div>
      <p class="empty-text">游戏不存在或已下架</p>
      <router-link to="/games" class="go-back">返回商城</router-link>
    </div>

    <!-- 游戏详情 -->
    <div class="detail-wrap" v-else>
      <div class="detail-left">
        <img
            :src="game.coverImage || placeholderImg"
            class="cover-img"
            :alt="game.name"
            @error="(e) => e.target.src = placeholderImg"
        />
        <div class="meta-list">
          <div class="meta-row" v-if="game.genre">
            <span class="meta-key">类型</span><span>{{ game.genre }}</span>
          </div>
          <div class="meta-row" v-if="game.developer">
            <span class="meta-key">开发商</span><span>{{ game.developer }}</span>
          </div>
          <div class="meta-row" v-if="game.publisher">
            <span class="meta-key">发行商</span><span>{{ game.publisher }}</span>
          </div>
          <div class="meta-row" v-if="game.platform">
            <span class="meta-key">平台</span><span>{{ game.platform }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-key">库存</span>
            <span :class="game.stock > 0 ? 'in-stock' : 'out-stock'">
              {{ game.stock > 0 ? `${game.stock} 份可购` : '暂时缺货' }}
            </span>
          </div>
        </div>
      </div>

      <div class="detail-right">
        <div class="breadcrumb">
          <router-link to="/">首页</router-link>
          <span> / </span>
          <router-link to="/games">游戏</router-link>
          <span> / {{ game.name }}</span>
        </div>

        <h1 class="game-name">{{ game.name }}</h1>

        <div class="price-block">
          <template v-if="game.isFlashSale && game.flashSalePrice">
            <span class="flash-tag">⚡ 限时特惠</span>
            <span class="price">¥{{ game.flashSalePrice }}</span>
            <span class="original-price">¥{{ game.price }}</span>
            <span class="discount">{{ discountPct }}% OFF</span>
          </template>
          <span class="price" v-else>¥{{ game.price }}</span>
        </div>

        <p class="description" v-if="game.description">{{ game.description }}</p>
        <p class="description no-desc" v-else>暂无游戏简介</p>

        <div class="action-row">
          <button class="btn-cart" @click="addToCart" :disabled="game.stock <= 0">
            <el-icon><ShoppingCart /></el-icon>
            加入购物车
          </button>
          <button class="btn-buy" @click="buyNow" :disabled="game.stock <= 0 || buying">
            {{ buying ? '处理中...' : '立即购买' }}
          </button>
        </div>

        <div class="guarantee">
          <span>✓ 正版授权</span>
          <span>✓ 即时发码</span>
          <span>✓ 7天售后</span>
        </div>
      </div>
    </div>
  </div>

  <PayDialog
      v-model="showPay"
      :order-no="pendingOrderNo"
      :amount="pendingAmount"
      @success="onPaySuccess"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { getGameDetailApi, createOrderApi } from '@/api'
import { ElMessage } from 'element-plus'
import PayDialog from '@/components/PayDialog.vue'

const route     = useRoute()
const router    = useRouter()
const auth      = useAuthStore()
const cartStore = useCartStore()

const game    = ref(null)
const loading = ref(false)
const buying  = ref(false)
const showPay       = ref(false)
const pendingOrderNo = ref('')
const pendingAmount  = ref(0)

const placeholderImg = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1a2e" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(77,127,255,0.3)" font-size="80">⬡</text></svg>'
)}`

onMounted(async () => {
  loading.value = true
  try {
    game.value = await getGameDetailApi(route.params.id)
  } catch (e) {
    game.value = null
    ElMessage.error('游戏加载失败')
  } finally {
    loading.value = false
  }
})

const discountPct = computed(() => {
  if (!game.value?.isFlashSale || !game.value?.flashSalePrice) return 0
  return Math.round((1 - Number(game.value.flashSalePrice) / Number(game.value.price)) * 100)
})

function addToCart() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  cartStore.addToCart(game.value.id)
}

async function buyNow() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  buying.value = true
  try {
    const order = await createOrderApi({ gameId: game.value.id })
    pendingOrderNo.value = order.orderNo
    pendingAmount.value  = order.amount
    showPay.value = true
  } catch (e) {
    ElMessage.error('创建订单失败：' + (e?.message || '请重试'))
  } finally {
    buying.value = false
  }
}

function onPaySuccess({ cdkCode }) {
  ElMessage.success(`支付成功！激活码：${cdkCode}`)
}
</script>

<style scoped>
.game-detail-page { max-width: 1100px; margin: 0 auto; padding: 40px 24px; min-height: 60vh; }
.loading-wrap { padding: 60px 0; }

.empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 100px 0; gap: 14px; text-align: center;
}
.empty-icon { font-size: 60px; opacity: .3; }
.empty-text { font-family: var(--font-display); font-size: 22px; color: var(--text-secondary); }
.go-back {
  padding: 10px 24px; background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  color: white; border-radius: 8px; text-decoration: none; font-weight: 600;
}

.detail-wrap { display: flex; gap: 40px; }

.detail-left { flex-shrink: 0; width: 320px; }
.cover-img { width: 100%; border-radius: 12px; border: 1px solid var(--border); display: block; }
.meta-list { margin-top: 20px; }
.meta-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px;
}
.meta-key { color: var(--text-muted); }
.meta-row span:last-child { color: var(--text-secondary); }
.in-stock { color: var(--neon-green) !important; font-weight: 600; }
.out-stock { color: var(--neon-pink) !important; font-weight: 600; }

.detail-right { flex: 1; }
.breadcrumb { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }
.breadcrumb a { color: var(--text-muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--neon-blue); }

.game-name { font-family: var(--font-display); font-size: 36px; font-weight: 700; margin-bottom: 20px; line-height: 1.2; }

.price-block {
  display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
  padding: 20px; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 12px; margin-bottom: 24px;
}
.flash-tag {
  font-size: 12px; background: rgba(255,210,0,.15); color: var(--gold);
  padding: 3px 10px; border-radius: 4px; align-self: center;
}
.price { font-family: var(--font-display); font-size: 40px; font-weight: 700; color: var(--neon-blue); }
.original-price { font-size: 18px; color: var(--text-muted); text-decoration: line-through; }
.discount { font-size: 13px; color: var(--neon-pink); font-weight: 600; }

.description { color: var(--text-secondary); line-height: 1.8; margin-bottom: 28px; font-size: 14px; }
.no-desc { color: var(--text-muted); font-style: italic; }

.action-row { display: flex; gap: 12px; margin-bottom: 20px; }
.btn-cart, .btn-buy {
  flex: 1; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all .2s; display: flex; align-items: center;
  justify-content: center; gap: 8px; font-family: var(--font-display); letter-spacing: 1px;
}
.btn-cart {
  background: transparent; border: 2px solid var(--neon-blue); color: var(--neon-blue);
}
.btn-cart:hover:not(:disabled) { background: rgba(77,127,255,.1); }
.btn-buy {
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  border: none; color: white;
}
.btn-buy:hover:not(:disabled) { box-shadow: var(--glow-blue); transform: translateY(-1px); }
.btn-cart:disabled, .btn-buy:disabled { opacity: .4; cursor: not-allowed; transform: none !important; }

.guarantee { display: flex; gap: 20px; font-size: 12px; color: var(--text-muted); }
</style>