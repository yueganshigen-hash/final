<template>
  <div class="game-card" @click="router.push(`/games/${game.id}`)">
    <div class="card-image">
      <img :src="game.coverImage || placeholderImg(game)" :alt="game.name" loading="lazy" />
      <div class="card-badges">
        <span class="badge flash" v-if="game.isFlashSale">特惠</span>
        <span class="badge hot" v-else-if="game.isHot">热门</span>
        <span class="badge genre" v-if="game.genre">{{ game.genre }}</span>
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ game.name }}</h3>
      <div class="card-meta">
        <span class="developer">{{ game.developer || '未知开发商' }}</span>
      </div>
      <div class="card-footer">
        <div class="price-wrap">
          <span class="price" v-if="game.isFlashSale">¥{{ game.flashSalePrice }}</span>
          <span class="price" v-else>¥{{ game.price }}</span>
          <span class="original-price" v-if="game.isFlashSale">¥{{ game.price }}</span>
        </div>
        <button class="cart-btn" @click.stop="addToCart">
          <el-icon><ShoppingCartFull /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ game: Object })
const router = useRouter()
const cartStore = useCartStore()
const auth = useAuthStore()

function addToCart() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  cartStore.addToCart(props.game.id)
}

const colors = ['#1a1a3e', '#1a2e1a', '#2e1a1a', '#1a2e2e', '#2e1a2e']
function placeholderImg(game) {
  const idx = (game.id || 0) % colors.length
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="220">
      <rect fill="${colors[idx]}" width="400" height="220"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
            fill="rgba(77,127,255,0.5)" font-size="48">⬡</text>
      <text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle"
            fill="rgba(200,210,255,0.6)" font-size="14" font-family="sans-serif">${game.name || ''}</text>
    </svg>
  `)}`
}
</script>

<style scoped>
.game-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden;
  cursor: pointer; transition: all .3s;
}
.game-card:hover {
  border-color: var(--neon-blue);
  box-shadow: 0 8px 32px rgba(77,127,255,.2);
  transform: translateY(-4px);
}

.card-image { position: relative; aspect-ratio: 16/9; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
.game-card:hover .card-image img { transform: scale(1.05); }

.card-badges { position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; }
.badge {
  padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
}
.badge.flash { background: rgba(255,210,0,.9); color: #000; }
.badge.hot   { background: rgba(255,45,120,.9); color: #fff; }
.badge.genre { background: rgba(0,0,0,.7); color: var(--text-secondary); border: 1px solid var(--border); }

.card-body { padding: 12px; }
.card-title {
  font-size: 14px; font-weight: 600; color: var(--text-primary);
  margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.developer { font-size: 11px; color: var(--text-muted); }
.card-meta { margin-bottom: 10px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }

.price-wrap { display: flex; align-items: baseline; gap: 6px; }
.price { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--neon-blue); }
.original-price { font-size: 12px; color: var(--text-muted); text-decoration: line-through; }

.cart-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(77,127,255,.1); border: 1px solid rgba(77,127,255,.3);
  color: var(--neon-blue); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.cart-btn:hover { background: var(--neon-blue); color: white; }
</style>
