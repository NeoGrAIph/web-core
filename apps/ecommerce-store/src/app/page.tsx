export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ marginTop: 0 }}>Synestra — E‑commerce Store</h1>
      <p style={{ maxWidth: 720 }}>
        Это каркас приложения <code>@synestra/ecommerce-store</code>. Целевая реализация будет
        опираться на Payload template <code>ecommerce</code> (BETA) и будет адаптирована под Postgres
        (CNPG), Stripe/webhooks и GitOps.
      </p>
      <p>
        Admin (после интеграции): <code>/admin</code>
      </p>
    </main>
  )
}

