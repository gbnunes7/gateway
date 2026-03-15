/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const SessionsController = () => import('#controllers/auth/sessions_controller')
const UsersController = () => import('#controllers/users_controller')
const ProductsController = () => import('#controllers/products_controller')
const ClientsController = () => import('#controllers/clients_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const GatewaysController = () => import('#controllers/gateways_controller')
import { Role } from '#domain/enums/role.enum'

router.get('/', () => ({ hello: 'world' }))

router
  .group(() => {
    router.post('auth/login', [SessionsController, 'store'])

    router.post('purchases', [TransactionsController, 'purchase'])
  })
  .prefix('/api/v1')

router
  .group(() => {
    router
      .group(() => {
        router.get('users', [UsersController, 'index'])
        router.post('users', [UsersController, 'store'])
        router.put('users/:id', [UsersController, 'update'])
        router.delete('users/:id', [UsersController, 'destroy'])
      })
      .use(middleware.role({ allowedRoles: [Role.ADMIN, Role.MANAGER] }))

    router
      .group(() => {
        router.get('products', [ProductsController, 'index'])
        router.post('products', [ProductsController, 'store'])
        router.put('products/:id', [ProductsController, 'update'])
        router.delete('products/:id', [ProductsController, 'destroy'])
      })
      .use(middleware.role({ allowedRoles: [Role.ADMIN, Role.MANAGER, Role.FINANCE] }))

    router
      .group(() => {
        router.get('clients', [ClientsController, 'index'])
        router.get('clients/:id', [ClientsController, 'show'])
      })
      .use(middleware.role({ allowedRoles: [Role.ADMIN, Role.MANAGER, Role.FINANCE] }))

    router
      .group(() => {
        router.get('transactions', [TransactionsController, 'index'])
        router.get('transactions/:id', [TransactionsController, 'show'])
        router.post('transactions/:id/refund', [TransactionsController, 'refund'])
      })
      .use(middleware.role({ allowedRoles: [Role.ADMIN, Role.FINANCE] }))

    router
      .group(() => {
        router.patch('gateways/:id/toggle', [GatewaysController, 'toggle'])
        router.patch('gateways/:id/priority', [GatewaysController, 'updatePriority'])
      })
      .use(middleware.role({ allowedRoles: [Role.ADMIN] }))
  })
  .prefix('/api/v1')
  .use(middleware.auth())
