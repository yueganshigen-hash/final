<template>
  <div>
    <h2 class="page-title">游戏管理（全平台）</h2>
    <el-table :data="games" v-loading="loading">
      <el-table-column label="游戏名称" prop="name" min-width="180" />
      <el-table-column label="商户" min-width="120">
        <template #default="{ row }">{{ row.merchant?.username }}</template>
      </el-table-column>
      <el-table-column label="类型" prop="genre" width="100" />
      <el-table-column label="价格" width="90">
        <template #default="{ row }"><span style="color:var(--neon-blue)">¥{{ row.price }}</span></template>
      </el-table-column>
      <el-table-column label="库存" prop="stock" width="80" />
      <el-table-column label="销量" prop="soldCount" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ON_SALE' ? 'success' : 'info'" size="small">
            {{ row.status === 'ON_SALE' ? '在售' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上架时间" width="150">
        <template #default="{ row }">{{ new Date(row.createdAt).toLocaleDateString('zh-CN') }}</template>
      </el-table-column>
    </el-table>
    <div class="pagination" v-if="total > 10">
      <el-pagination v-model:current-page="page" :total="total" :page-size="10"
                     layout="prev, pager, next" @current-change="fetch" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getGamesApi } from '@/api'
const games = ref([]), loading = ref(false), total = ref(0), page = ref(1)
onMounted(fetch)
async function fetch() {
  loading.value = true
  try {
    const res = await getGamesApi({ page: page.value - 1, size: 10 })
    games.value = res.content || res; total.value = res.totalElements || res.length
  } finally { loading.value = false }
}
</script>

<style scoped>
.page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: center; }
</style>
