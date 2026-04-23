<template>
  <div class="game-list-page">
    <div class="page-header">
      <h1>游戏商城</h1>
      <div class="filters">
        <div class="genre-tabs">
          <button
              v-for="g in genres" :key="g.value"
              :class="['genre-tab', activeGenre === g.value && 'active']"
              @click="setGenre(g.value)"
          >{{ g.label }}</button>
        </div>
        <el-input
            v-model="searchKw" placeholder="搜索游戏名称..."
            size="small" style="width:200px" clearable
            @keyup.enter="doSearch" @clear="doSearch"
        >
          <template #suffix>
            <el-icon @click="doSearch" style="cursor:pointer"><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="4" animated />
    </div>

    <div class="game-grid" v-else-if="games.length > 0">
      <GameCard v-for="g in games" :key="g.id" :game="g" />
    </div>

    <div class="empty-wrap" v-else>
      <div class="empty-icon">🎮</div>
      <p class="empty-text">暂无游戏</p>
      <p class="empty-sub">{{ searchKw ? `未找到"${searchKw}"相关游戏` : '商户正在上架游戏中' }}</p>
    </div>

    <div class="pagination" v-if="total > pageSize">
      <el-pagination
          v-model:current-page="currentPage"
          :total="total" :page-size="pageSize"
          layout="prev, pager, next"
          @current-change="fetchGames"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getGamesApi, searchGamesApi } from '@/api'
import GameCard from '@/components/GameCard.vue'

const route = useRoute()
const games       = ref([])
const loading     = ref(false)
const total       = ref(0)
const currentPage = ref(1)
const pageSize    = 12
const activeGenre = ref('')
const searchKw    = ref('')

const genres = [
  { value: '',           label: '全部' },
  { value: 'Action',     label: '动作' },
  { value: 'RPG',        label: 'RPG' },
  { value: 'Strategy',   label: '策略' },
  { value: 'Simulation', label: '模拟' },
  { value: 'Sports',     label: '体育' },
  { value: 'Indie',      label: '独立' },
]

onMounted(() => {
  if (route.query.keyword) searchKw.value = String(route.query.keyword)
  fetchGames()
})

async function fetchGames() {
  loading.value = true
  try {
    const params = { page: currentPage.value - 1, size: pageSize }
    let res
    if (searchKw.value.trim()) {
      res = await searchGamesApi({ ...params, keyword: searchKw.value })
    } else {
      if (activeGenre.value) params.genre = activeGenre.value
      res = await getGamesApi(params)
    }
    games.value = res?.content || (Array.isArray(res) ? res : [])
    total.value = res?.totalElements || games.value.length
  } catch (e) {
    games.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function setGenre(g) {
  activeGenre.value = g
  searchKw.value    = ''
  currentPage.value = 1
  fetchGames()
}

function doSearch() {
  currentPage.value = 1
  fetchGames()
}
</script>

<style scoped>
.game-list-page { max-width: 1280px; margin: 0 auto; padding: 32px 24px; min-height: 60vh; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-family: var(--font-display); font-size: 32px; font-weight: 700; margin-bottom: 16px; }
.filters { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }

.genre-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.genre-tab {
  padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--text-secondary); cursor: pointer;
  font-size: 13px; transition: all .2s; font-family: var(--font-body);
}
.genre-tab.active, .genre-tab:hover {
  border-color: var(--neon-blue); color: var(--neon-blue); background: rgba(77,127,255,.08);
}

.loading-wrap { padding: 40px 0; }
.game-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 0; gap: 12px; text-align: center;
}
.empty-icon { font-size: 56px; opacity: .3; }
.empty-text { font-family: var(--font-display); font-size: 20px; color: var(--text-secondary); }
.empty-sub  { font-size: 13px; color: var(--text-muted); }

.pagination { margin-top: 32px; display: flex; justify-content: center; }
</style>