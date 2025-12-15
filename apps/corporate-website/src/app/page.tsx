export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ marginTop: 0 }}>Synestra — Corporate Website</h1>
      <p style={{ maxWidth: 720 }}>
        Это каркас приложения <code>@synestra/corporate-website</code>. Целевая реализация будет
        собрана на базе Payload template <code>website</code> и адаптирована под Postgres (CNPG) и
        GitOps.
      </p>
      <p>
        Admin (после интеграции): <code>/admin</code>
      </p>
    </main>
  )
}

