import { post } from './client.js'

export function loginUser(values) {
  return post('/auth/login', values)
}

export function registerUser(values) {
  return post('/auth/register', values)
}
