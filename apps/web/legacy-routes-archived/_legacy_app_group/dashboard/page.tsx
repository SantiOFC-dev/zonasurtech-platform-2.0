const cards = [
  "Facturacion",
  "Ventas",
  "Inventario",
  "CRM",
  "WhatsApp"
];

export default function DashboardPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard central</h1>
      <p>Tenant activo: demo-tenant-cr</p>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        {cards.map((c) => (
          <article key={c} style={{ padding: 16, border: "1px solid #223154", borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>{c}</h3>
            <p style={{ color: "#9FB0D1" }}>Estado: disponible</p>
          </article>
        ))}
      </section>
    </main>
  );
}
