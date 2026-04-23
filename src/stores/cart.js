import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCartApi, addCartApi, removeCartApi, clearCartApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const count = ref(0)

  async function fetchCart() {
    try {
      const res = await getCartApi()
      items.value = Array.isArray(res) ? res : []
      count.value = items.value.length
    } catch (e) {
      // 静默失败，不崩溃页面
      items.value = []
      count.value = 0
    }
  }

  async function addToCart(gameId) {
    try {
      await addCartApi({ gameId })
      await fetchCart()
      ElMessage.success('已加入购物车')
    } catch (e) {
      // error handled by interceptor
    }
  }

  async function removeFromCart(id) {
    try {
      await removeCartApi(id)
      await fetchCart()
    } catch (e) {
      ElMessage.error('移除失败，请重试')
    }
  }

  async function clearCart() {
    try {
      await clearCartApi()
      items.value = []
      count.value = 0
    } catch (e) {
      ElMessage.error('清空失败，请重试')
    }
  }

  return { items, count, fetchCart, addToCart, removeFromCart, clearCart }
})