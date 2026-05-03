import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Star, MessageSquareText, BadgeCheck } from "lucide-react";

export default function ReviewsPage() {
  const { state, dispatch } = useApp();
  const me = state.currentUser;
  const [subjectId, setSubjectId] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [projectId, setProjectId] = useState("");

  const reviews = useMemo(() => Object.values(state.reviews).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [state.reviews]);
  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0";

  const createReview = () => {
    if (!me || !subjectId.trim()) return;
    dispatch({
      type: "addReview",
      payload: {
        id: `rev_${Date.now()}_${Math.round(Math.random() * 1000)}`,
        reviewerId: me.id,
        subjectId,
        projectId: projectId || undefined,
        rating,
        text: text.trim() || "Great collaboration quality.",
        createdAt: new Date().toISOString(),
      },
    });
    setSubjectId("");
    setRating(5);
    setText("");
    setProjectId("");
  };

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="ds-chip-primary">Reviews</span>
          <h1 className="ds-page-title mt-2">Credibility and collaboration feedback</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">Write reviews for collaborators after a project, then show those ratings on their profile for future trust.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-[240px]">
          <div className="ds-card p-4 text-center">
            <div className="text-2xl font-bold">{reviews.length}</div>
            <div className="text-xs text-muted-foreground">Reviews</div>
          </div>
          <div className="ds-card p-4 text-center">
            <div className="text-2xl font-bold">{average}</div>
            <div className="text-xs text-muted-foreground">Avg rating</div>
          </div>
          <div className="ds-card p-4 text-center">
            <div className="text-2xl font-bold">{reviews.filter((review) => review.rating >= 4).length}</div>
            <div className="text-xs text-muted-foreground">Positive</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <div className="ds-card p-5 space-y-4 h-fit">
          <div>
            <h2 className="font-semibold text-lg">Write a review</h2>
            <p className="text-sm text-muted-foreground">Leave feedback for a collaborator or project teammate.</p>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Builder</span>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm">
              <option value="">Select builder</option>
              {Object.values(state.users).filter((user) => user.id !== me?.id).map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Project reference</span>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm">
              <option value="">Optional project</option>
              {Object.values(state.posts).map((post) => (
                <option key={post.id} value={post.id}>{post.title}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Rating</span>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                return (
                  <button key={value} type="button" onClick={() => setRating(value)} className={`size-10 rounded-xl border flex items-center justify-center ${value <= rating ? "bg-primary text-white border-primary" : "bg-card border-border"}`}>
                    <Star className="size-4" fill={value <= rating ? "currentColor" : "none"} />
                  </button>
                );
              })}
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Feedback</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Call out communication, ownership, quality, or reliability..." className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
          </label>

          <button onClick={createReview} disabled={!subjectId.trim()} className="h-11 w-full rounded-xl bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            Submit review
          </button>
        </div>

        <div className="space-y-3">
          {reviews.length ? reviews.map((review) => {
            const reviewer = state.users[review.reviewerId];
            const subject = state.users[review.subjectId];

            return (
              <div key={review.id} className="ds-card p-4 flex items-start gap-3">
                <div className="size-11 rounded-2xl bg-gradient-primary text-white flex items-center justify-center font-semibold shrink-0">
                  {subject?.avatar || subject?.name?.slice(0, 2) || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">{subject?.name || "Unknown builder"}</div>
                    <span className="ds-chip-primary inline-flex items-center gap-1"><BadgeCheck className="size-3.5" /> {review.rating}/5</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-2">
                    <MessageSquareText className="size-4" /> Reviewed by {reviewer?.name || "Project Lead"}
                  </div>
                  <p className="text-sm mt-3">{review.text}</p>
                  <div className="text-xs text-muted-foreground mt-2">{review.projectId ? `Project: ${state.posts[review.projectId]?.title || review.projectId}` : "No project linked"} · {new Date(review.createdAt).toLocaleString()}</div>
                </div>
              </div>
            );
          }) : (
            <div className="ds-card p-16 text-center">
              <div className="size-14 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center mb-4">
                <Star className="size-6" />
              </div>
              <h3 className="font-semibold text-lg">No reviews yet</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Once collaborations finish, leave feedback here to build credibility on profile pages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
