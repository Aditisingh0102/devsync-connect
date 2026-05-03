import { useApp } from "@/lib/store";

export default function Dashboard() {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {state.currentUser ? (
          <div>
            <h1 className="text-4xl font-bold mb-8">Welcome back, {state.currentUser.name}!</h1>
            <p className="text-lg text-muted-foreground">Dashboard coming soon...</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-muted-foreground">Please log in to view your dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
