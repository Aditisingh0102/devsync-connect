import React from "react";
import Feed from "@/components/Feed";

export default function FeedPage() {
  return (
    <div className="container py-10">
      <h1 className="ds-page-title mb-6">Collaboration Feed</h1>
      <Feed />
    </div>
  );
}
