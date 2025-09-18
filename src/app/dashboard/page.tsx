export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <p>Login succeeded. Replace this with your real dashboard.</p>
      <form action="/api/auth/logout" method="post" className="mt-4">
        <button className="bg-gray-800 text-white px-3 py-2 rounded">Log out</button>
      </form>
    </div>
  );
}
