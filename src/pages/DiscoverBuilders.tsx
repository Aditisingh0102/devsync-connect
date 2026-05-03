import { useApp } from "@/lib/store";

export default function DiscoverBuilders() {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Discover Builders</h1>
        <p className="text-lg text-muted-foreground">Discover page coming soon...</p>
      </div>
    </div>
  );
}
