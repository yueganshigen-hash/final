<template>
  <div class="cdk-manage">
    <h2 class="page-title">CDK 库存管理</h2>

    <div class="import-section">
      <div class="import-card">
        <h3>批量导入激活码</h3>
        <el-form label-width="80px">
          <el-form-item label="选择游戏">
            <el-select v-model="gameId" placeholder="选择游戏" style="width:100%">
              <el-option v-for="g in games" :key="g.id" :label="g.name" :value="g.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="CDK列表">
            <el-input v-model="codesText" type="textarea" :rows="8"
                      placeholder="每行一个CDK，例如：&#10;AAAAA-BBBBB-CCCCC&#10;DDDDD-EEEEE-FFFFF" />
          </el-form-item>
          <el-form-item>
            <el-button @click="genTestCdk">生成测试CDK</el-button>
            <el-button type="primary" :loading="importing" @click="doImport">导入</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="stock-panel">
        <h3>各游戏CDK库存</h3>
        <div class="stock-list">
          <div class="stock-item" v-for="g in games" :key="g.id">
            <div class="stock-game">
              <span class="stock-name">{{ g.name }}</span>
              <span class="stock-nums">
                <span class="avail">{{ g.stock }} 可用</span>
              </span>
            </div>
            <div class="stock-bar-wrap">
              <div class="stock-bar" :style="{ width: Math.min(g.stock / 100 * 100, 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyGamesApi, importCdkApi } from '@/api'
import { ElMessage } from 'element-plus'

const games = ref([])
const gameId = ref(null)
const codesText = ref('')
const importing = ref(false)

onMounted(async () => {
  const res = await getMyGamesApi({ page: 0, size: 100 })
  games.value = res.content || res
})

async function doImport() {
  if (!gameId.value) { ElMessage.warning('请选择游戏'); return }
  const codes = codesText.value.split('\n').map(c => c.trim()).filter(Boolean)
  if (!codes.length) { ElMessage.warning('请输入CDK'); return }
  importing.value = true
  try {
    const res = await importCdkApi({ gameId: gameId.value, codes })
    ElMessage.success(`成功导入 ${res.count} 个CDK`)
    codesText.value = ''
    const resGames = await getMyGamesApi({ page: 0, size: 100 })
    games.value = resGames.content || resGames
  } finally { importing.value = false }
}

function genTestCdk() {
  const rand = () => Math.random().toString(36).substring(2, 7).toUpperCase()
  codesText.value = Array.from({ length: 10 }, () => `${rand()}-${rand()}-${rand()}-${rand()}`).join('\n')
  ElMessage.info('已生成10个测试CDK，可直接导入')
}
</script>

<style scoped>
.cdk-manage { }
.page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; margin-bottom: 24px; }
.import-section { display: flex; gap: 24px; align-items: flex-start; }
.import-card {
  flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px;
}
.import-card h3 { font-family: var(--font-display); margin-bottom: 16px; }
.stock-panel {
  width: 280px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px;
}
.stock-panel h3 { font-family: var(--font-display); margin-bottom: 16px; }
.stock-list { display: flex; flex-direction: column; gap: 14px; }
.stock-game { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
.stock-name { color: var(--text-secondary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.avail { color: var(--neon-green); font-weight: 600; }
.stock-bar-wrap { height: 4px; background: var(--bg-deep); border-radius: 2px; }
.stock-bar { height: 4px; background: var(--neon-green); border-radius: 2px; transition: width .3s; }
</style>
