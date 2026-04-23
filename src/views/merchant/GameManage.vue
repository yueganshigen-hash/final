<template>
  <div class="game-manage">
    <div class="top-bar">
      <h2 class="page-title">游戏管理</h2>
      <button class="add-btn" @click="openAdd">+ 新增游戏</button>
    </div>

    <el-table :data="games" v-loading="loading">
      <el-table-column label="封面" width="80">
        <template #default="{ row }">
          <img :src="row.coverImage || ''" style="width:60px;height:35px;object-fit:cover;border-radius:4px;background:#1a1a2e" />
        </template>
      </el-table-column>
      <el-table-column label="游戏名称" prop="name" min-width="160" />
      <el-table-column label="类型" prop="genre" width="100" />
      <el-table-column label="价格" width="90">
        <template #default="{ row }">
          <span style="color:var(--neon-blue);font-family:var(--font-display)">¥{{ row.price }}</span>
        </template>
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
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="del(row.id)">下架</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination" v-if="total > 10">
      <el-pagination v-model:current-page="page" :total="total" :page-size="10"
                     layout="prev, pager, next" @current-change="fetch" />
    </div>
  </div>

  <!-- Add/Edit Dialog -->
  <el-dialog v-model="showDialog" :title="editId ? '编辑游戏' : '新增游戏'" width="540px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="游戏名称"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="封面图URL"><el-input v-model="form.coverImage" placeholder="https://..." /></el-form-item>
      <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.genre" style="width:100%">
          <el-option v-for="g in genres" :key="g" :label="g" :value="g" />
        </el-select>
      </el-form-item>
      <el-form-item label="开发商"><el-input v-model="form.developer" /></el-form-item>
      <el-form-item label="平台"><el-input v-model="form.platform" placeholder="PC / Console" /></el-form-item>
      <el-form-item label="价格"><el-input-number v-model="form.price" :precision="2" :min="0" /></el-form-item>
      <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" /></el-form-item>
      <el-form-item label="限时特惠">
        <el-switch v-model="form.isFlashSale" />
        <el-input-number v-if="form.isFlashSale" v-model="form.flashSalePrice" :precision="2" :min="0"
                         placeholder="特惠价" style="margin-left:12px;width:140px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showDialog = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMyGamesApi, addGameApi, updateGameApi, deleteGameApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const games = ref([]), loading = ref(false), total = ref(0), page = ref(1)
const showDialog = ref(false), saving = ref(false), editId = ref(null)
const form = reactive({ name:'', coverImage:'', description:'', genre:'Action', developer:'', platform:'PC', price:0, stock:0, isFlashSale:false, flashSalePrice:0 })
const genres = ['Action','RPG','Strategy','Simulation','Sports','Indie','Puzzle','Adventure']

onMounted(fetch)
async function fetch() {
  loading.value = true
  try {
    const res = await getMyGamesApi({ page: page.value - 1, size: 10 })
    games.value = res.content || res; total.value = res.totalElements || res.length
  } finally { loading.value = false }
}

function openAdd() {
  editId.value = null
  Object.assign(form, { name:'', coverImage:'', description:'', genre:'Action', developer:'', platform:'PC', price:0, stock:0, isFlashSale:false, flashSalePrice:0 })
  showDialog.value = true
}
function openEdit(row) {
  editId.value = row.id; Object.assign(form, row); showDialog.value = true
}
async function save() {
  saving.value = true
  try {
    if (editId.value) await updateGameApi(editId.value, form)
    else await addGameApi(form)
    ElMessage.success('保存成功'); showDialog.value = false; fetch()
  } finally { saving.value = false }
}
async function del(id) {
  await ElMessageBox.confirm('确认下架该游戏？', '提示', { type: 'warning' })
  await deleteGameApi(id); ElMessage.success('已下架'); fetch()
}
</script>

<style scoped>
.game-manage {}
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; }
.add-btn {
  padding: 10px 20px; border-radius: 8px;
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
  border: none; color: white; cursor: pointer; font-size: 14px; font-weight: 600;
  transition: all .2s;
}
.add-btn:hover { box-shadow: var(--glow-blue); }
.pagination { margin-top: 20px; display: flex; justify-content: center; }
</style>
