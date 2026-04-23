import request from './request'

// ===== 认证 =====
export const loginApi          = (data) => request.post('/auth/login', data)
export const registerApi       = (data) => request.post('/auth/register', data)
export const getMeApi          = ()     => request.get('/auth/me')
export const sendEmailCodeApi  = (data) => request.post('/email/code', data)

// ===== 游戏 =====
export const getGamesApi      = (params) => request.get('/games', { params })
export const getGameDetailApi = (id)     => request.get(`/games/${id}`)
export const getHotGamesApi   = ()       => request.get('/games/hot')
export const getFlashSaleApi  = ()       => request.get('/games/flash-sale')
export const getNewReleaseApi = ()       => request.get('/games/new-release')
export const searchGamesApi   = (params) => request.get('/games/search', { params })
export const getMyGamesApi    = (params) => request.get('/games/mine', { params })
export const addGameApi       = (data)   => request.post('/games', data)
export const updateGameApi    = (id, d)  => request.put(`/games/${id}`, d)
export const deleteGameApi    = (id)     => request.delete(`/games/${id}`)

// ===== 购物车 =====
export const getCartApi      = ()    => request.get('/cart')
export const addCartApi      = (d)   => request.post('/cart', d)
export const removeCartApi   = (id)  => request.delete(`/cart/${id}`)
export const clearCartApi    = ()    => request.delete('/cart')
export const getCartCountApi = ()    => request.get('/cart/count')

// ===== 订单 =====
export const createOrderApi    = (d)  => request.post('/orders', d)
export const getMyOrdersApi    = (p)  => request.get('/orders/my', { params: p })
export const getOrderDetailApi = (no) => request.get(`/orders/${no}`)
export const cancelOrderApi    = (no) => request.patch(`/orders/${no}/cancel`)
export const payOrderApi       = (no) => request.post(`/pay/${no}`)

// ===== CDK =====
export const getMyCdkApi    = ()    => request.get('/cdk/my')
export const importCdkApi   = (d)   => request.post('/cdk/import', d)
export const getCdkStockApi = (id)  => request.get(`/cdk/stock/${id}`)

// ===== 管理员 =====
export const getDashboardStatsApi = ()    => request.get('/admin/stats')
export const getAllUsersApi        = (p)  => request.get('/admin/users', { params: p })
export const getAllOrdersApi       = (p)  => request.get('/admin/orders', { params: p })
export const toggleUserApi        = (id) => request.patch(`/admin/users/${id}/toggle`)