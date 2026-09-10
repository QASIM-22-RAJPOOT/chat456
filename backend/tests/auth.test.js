import test from 'node:test'
import assert from 'node:assert/strict'
import User from '../models/User.js'
import { login, register } from '../controllers/authController.js'
import { verifyPassword } from '../utils/password.js'

async function invoke(handler, body) {
  const response = {
    status(code) { this.code = code; return this },
    json(data) { this.data = data; return this },
  }
  await handler({ body }, response)
  return response
}

test('invalid input is rejected before accessing the database', async () => {
  for (const handler of [login, register]) {
    for (const body of [undefined, {}, { email: { $ne: null }, password: 'secret123' }]) {
      assert.equal((await invoke(handler, body)).code, 400)
    }
  }
  assert.equal((await invoke(register, { name: 'Test', email: 'a@b.com', password: 'short' })).code, 400)
})

test('registration hashes passwords; login verifies them without exposing the hash', async (t) => {
  let saved
  t.mock.method(User, 'exists', async () => null)
  t.mock.method(User, 'create', async (data) => {
    saved = { _id: 'test-user', ...data }
    return saved
  })
  const registration = await invoke(register, {
    name: ' Test User ', email: ' TEST@example.com ', password: 'secret123',
  })
  assert.equal(registration.code, 201)
  assert.equal(saved.email, 'test@example.com')
  assert.equal(saved.name, 'Test User')
  assert.equal(saved.password, undefined)
  assert.notEqual(saved.passwordHash, 'secret123')
  assert.equal(await verifyPassword('secret123', saved.passwordHash), true)
  assert.equal(registration.data.user.passwordHash, undefined)

  t.mock.method(User, 'findOne', (query) => {
    assert.equal(query.email, 'test@example.com')
    return { select: async () => saved }
  })
  const successful = await invoke(login, { email: 'TEST@example.com', password: 'secret123' })
  assert.equal(successful.code, 200)
  assert.equal(successful.data.user.passwordHash, undefined)
  const wrong = await invoke(login, { email: 'test@example.com', password: 'wrong123' })
  assert.equal(wrong.code, 401)
})

test('duplicate inserts and database failures return safe responses', async (t) => {
  const body = { name: 'Test', email: 'test@example.com', password: 'secret123' }
  const exists = t.mock.method(User, 'exists', async () => ({ _id: 'existing' }))
  assert.equal((await invoke(register, body)).code, 409)
  exists.mock.mockImplementation(async () => null)
  t.mock.method(User, 'create', async () => { throw { code: 11000 } })
  assert.equal((await invoke(register, body)).code, 409)
  exists.mock.mockImplementation(async () => { throw new Error('private database details') })
  const failed = await invoke(register, body)
  assert.equal(failed.code, 500)
  assert.doesNotMatch(failed.data.message, /private database/)
  const find = t.mock.method(User, 'findOne', () => ({ select: async () => null }))
  assert.equal((await invoke(login, body)).code, 401)
  find.mock.mockImplementation(() => { throw new Error('private database details') })
  assert.equal((await invoke(login, body)).code, 500)
})
