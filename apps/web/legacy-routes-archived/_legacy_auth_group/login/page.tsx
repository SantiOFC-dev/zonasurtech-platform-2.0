export default function LoginPage() {
  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Login central</h1>
      <p>MVP: autenticar contra Supabase Auth central.</p>
      <form>
        <input placeholder="email@empresa.com" style={{ width: "100%", marginBottom: 12, padding: 10 }} />
        <input placeholder="password" type="password" style={{ width: "100%", marginBottom: 12, padding: 10 }} />
        <button type="submit">Ingresar</button>
      </form>
    </main>
  );
}
