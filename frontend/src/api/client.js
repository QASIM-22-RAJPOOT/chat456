export async function post(path, values) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
  } catch {
    throw new Error('Backend se connection nahi ho raha. Dobara try karo.')
  }
  const data = await response.json().catch(() => {
    throw new Error('Backend se valid response nahi mila.')
  })
  if (!response.ok) throw new Error(data.message || 'Request failed.')
  return data
}
