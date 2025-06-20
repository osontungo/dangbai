import { useState } from 'react'

export default function Home() {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('')

  const handleSync = async () => {
    setStatus('Đang xử lý...')
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const data = await res.json()
    setStatus(data.message)
  }

  return (
    <div style={{ maxWidth: 500, margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h2>Focus Sync Tool</h2>
      <input
        type="text"
        placeholder="Nhập username Twitter"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: 10, width: '100%' }}
      />
      <button onClick={handleSync} style={{ marginTop: 10, padding: 10 }}>
        Sync lên Focus.xyz
      </button>
      {status && <p style={{ marginTop: 20 }}>{status}</p>}
    </div>
  )
}
