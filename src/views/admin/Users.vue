<template>
  <div>
    <h2 class="page-title">用户管理</h2>
    <el-table :data="users" v-loading="loading">
      <el-table-column label="ID" prop="id" width="70" />
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="邮箱" prop="email" min-width="180" />
      <el-table-column label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="roleType[row.role]" size="small">{{ row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="店铺" prop="shopName" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'danger'" size="small">
            {{ row.enabled ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="160">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" :type="row.enabled ? 'danger' : 'success'" plain
                     @click="toggle(row)">{{ row.enabled ? '禁用' : '启用' }}</el-button>
        </template>
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
import { getAllUsersApi, toggleUserApi } from '@/api'
import { ElMessage } from 'element-plus'

const users = ref([]), loading = ref(false), total = ref(0), page = ref(1)
const roleType = { USER: '', MERCHANT: 'warning', ADMIN: 'danger' }

onMounted(fetch)
async function fetch() {
  loading.value = true
  try {
    const res = await getAllUsersApi({ page: page.value - 1, size: 10 })
    users.value = res.content || res; total.value = res.totalElements || res.length
  } finally { loading.value = false }
}
async function toggle(row) {
  await toggleUserApi(row.id); ElMessage.success('操作成功'); fetch()
}
function formatDate(s) { return s ? new Date(s).toLocaleDateString('zh-CN') : '—' }
</script>

<style scoped>
.page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; margin-bottom: 20px; }
.pagination { margin-top: 20px; display: flex; justify-content: center; }
</style>
