import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: '/api',
    timeout: 15000
})

request.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

request.interceptors.response.use(
    res => {
        const { code, message, data } = res.data
        if (code === 200) return data
        ElMessage.error(message || '请求失败')
        return Promise.reject(new Error(message || '请求失败'))
    },
    err => {
        const status = err.response?.status
        if (status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // 用 window.location 避免循环依赖 router
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login'
            }
        } else if (status === 403) {
            ElMessage.error('无权限操作')
        } else if (status === 404) {
            ElMessage.error('接口不存在')
        } else if (err.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请重试')
        } else {
            ElMessage.error(err.response?.data?.message || '网络错误')
        }
        return Promise.reject(err)
    }
)

export default request