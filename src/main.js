import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElIcons from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './assets/global.css'

const app = createApp(App)

// Register all Element Plus icons
Object.entries(ElIcons).forEach(([name, comp]) => app.component(name, comp))

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 全局错误处理 - 捕获所有未处理错误，防止黑屏
app.config.errorHandler = (err, instance, info) => {
    console.error('[Vue Error]', err, '\nInfo:', info)
    // 不让错误冒泡导致黑屏
}

// 捕获 Promise 未处理的 rejection
window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise]', event.reason)
    event.preventDefault()
})

app.mount('#app')