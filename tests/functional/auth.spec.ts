import { test } from '@japa/runner'

test.group('Auth', () => {
  test('POST /api/v1/auth/login returns token for valid credentials', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'admin@betalent.tech',
      password: 'secret',
    })
    response.assertStatus(200)
    const body = response.body()
    assert.property(body, 'data')
    assert.property(body.data, 'token')
    assert.property(body.data, 'user')
  })

  test('POST /api/v1/auth/login returns 401 for invalid credentials', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'admin@betalent.tech',
      password: 'wrong',
    })
    response.assertStatus(401)
  })
})
