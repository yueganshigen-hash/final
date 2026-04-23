<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="hero-content">
        <div class="hero-badge">GAME STORE</div>
        <h1 class="hero-title">
          探索无限<br/>
          <span class="neon-text">游戏宇宙</span>
        </h1>
        <p class="hero-desc">正版激活码 · 即时发货 · 海量好游戏</p>
        <div class="hero-actions">
          <router-link to="/games" class="btn-primary">浏览全部游戏 →</router-link>
          <router-link to="/register" class="btn-ghost" v-if="!auth.isLoggedIn">免费注册</router-link>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-item" v-for="s in stats" :key="s.label">
          <span class="stat-value neon-text">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <!-- Flash Sale -->
    <section class="section" v-if="flashSale.length">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-badge flash">⚡ 限时特惠</span>
          <h2 class="section-title">TODAY'S DEALS</h2>
        </div>
        <router-link to="/games" class="see-all">查看全部 →</router-link>
      </div>
      <div class="game-grid">
        <GameCard v-for="g in flashSale" :key="g.id" :game="g" />
      </div>
    </section>

    <!-- Hot Games -->
    <section class="section" v-if="hotGames.length">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-badge hot">🔥 热门推荐</span>
          <h2 class="section-title">HOT GAMES</h2>
        </div>
        <router-link to="/games" class="see-all">查看全部 →</router-link>
      </div>
      <div class="game-grid">
        <GameCard v-for="g in hotGames" :key="g.id" :game="g" />
      </div>
    </section>

    <!-- New Release -->
    <section class="section" v-if="newRelease.length">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-badge new">✦ 最新上架</span>
          <h2 class="section-title">NEW RELEASE</h2>
        </div>
        <router-link to="/games" class="see-all">查看全部 →</router-link>
      </div>
      <div class="game-grid">
        <GameCard v-for="g in newRelease" :key="g.id" :game="g" />
      </div>
    </section>

    <!-- 全部为空时的引导 -->
    <section class="section" v-if="!loading && !hotGames.length && !flashSale.length && !newRelease.length">
      <div class="empty-home">
        <div class="empty-icon">🎮</div>
        <p class="empty-text">暂时没有游戏</p>
        <p class="empty-sub">商户正在上架游戏中，请稍后再来</p>
        <router-link to="/games" class="btn-primary" style="margin-top:16px">前往游戏商城</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getHotGamesApi, getFlashSaleApi, getNewReleaseApi } from '@/api'
import GameCard from '@/components/GameCard.vue'

const auth       = useAuthStore()
const hotGames   = ref([])
const flashSale  = ref([])
const newRelease = ref([])
const loading    = ref(true)

const stats = [
  { value: '10,000+', label: '款游戏' },
  { value: '500+',    label: '商户入驻' },
  { value: '100万+',  label: '玩家注册' },
  { value: '99.9%',   label: '好评率' },
]

onMounted(async () => {
  loading.value = true
  // 每个接口单独 try-catch，互不影响
  try {
    const res = await getHotGamesApi()
    hotGames.value = Array.isArray(res) ? res : (res?.content || [])
  } catch (e) {
    hotGames.value = []
  }

  try {
    const res = await getFlashSaleApi()
    flashSale.value = Array.isArray(res) ? res : (res?.content || [])
  } catch (e) {
    flashSale.value = []
  }

  try {
    const res = await getNewReleaseApi()
    newRelease.value = Array.isArray(res) ? res : (res?.content || [])
  } catch (e) {
    newRelease.value = []
  }

  loading.value = false
})
</script>

<style scoped>
.home { background: var(--bg-void); }

.hero {
  min-height: 480px;
  background: linear-gradient(135deg, #050510 0%, #0a0520 50%, #050510 100%);
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 80px 24px 60px;
}
.hero-grid {
  position: absolute; inset: 0;
  background-image:
      linear-gradient(rgba(77,127,255,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(77,127,255,.06) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}
.hero::before {
  content: '';
  position: absolute;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(77,127,255,.12) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; text-align: center; }
.hero-badge {
  display: inline-block;
  padding: 4px 14px; border-radius: 100px;
  border: 1px solid var(--neon-cyan); color: var(--neon-cyan);
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 3px;
  margin-bottom: 20px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(36px, 6vw, 72px);
  font-weight: 700; line-height: 1.1;
  margin-bottom: 16px;
}
.hero-desc { color: var(--text-secondary); font-size: 16px; margin-bottom: 32px; }

.hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.btn-primary {
  padding: 12px 28px; border-radius: 8px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  color: white; text-decoration: none; font-weight: 600; font-size: 15px;
  transition: all .2s; display: inline-block;
}
.btn-primary:hover { box-shadow: var(--glow-blue); transform: translateY(-2px); }
.btn-ghost {
  padding: 12px 28px; border-radius: 8px;
  border: 1px solid var(--border); color: var(--text-secondary);
  text-decoration: none; font-size: 15px; transition: all .2s;
}
.btn-ghost:hover { border-color: var(--neon-blue); color: var(--neon-blue); }

.hero-stats {
  position: relative; z-index: 1;
  display: flex; gap: 48px; margin-top: 48px; flex-wrap: wrap; justify-content: center;
}
.stat-item { text-align: center; }
.stat-value { display: block; font-family: var(--font-display); font-size: 24px; font-weight: 700; }
.stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: block; }

.section { max-width: 1280px; margin: 0 auto; padding: 48px 24px; }
.section-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 24px;
}
.section-title-wrap { display: flex; flex-direction: column; gap: 4px; }
.section-badge {
  display: inline-block; font-size: 11px; letter-spacing: 2px;
  padding: 3px 10px; border-radius: 4px;
}
.section-badge.flash { background: rgba(255,210,0,.1); color: var(--gold); border: 1px solid rgba(255,210,0,.3); }
.section-badge.hot   { background: rgba(255,45,120,.1); color: var(--neon-pink); border: 1px solid rgba(255,45,120,.3); }
.section-badge.new   { background: rgba(0,255,136,.1); color: var(--neon-green); border: 1px solid rgba(0,255,136,.3); }
.section-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: 2px; }
.see-all { color: var(--neon-blue); text-decoration: none; font-size: 13px; }
.see-all:hover { text-decoration: underline; }

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.empty-home {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 0; gap: 12px; text-align: center;
}
.empty-icon { font-size: 60px; opacity: .3; }
.empty-text { font-family: var(--font-display); font-size: 22px; color: var(--text-secondary); }
.empty-sub { font-size: 14px; color: var(--text-muted); }
</style>