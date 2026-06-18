import React, { useMemo, useState } from "react";
import { useApp, createPostDraft } from "@/lib/store";
import { PostType } from "@/lib/types";
import { Link } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const postTypes: PostType[] = [
  "Looking for Team",
  "Seeking Contributor",
  "Open to Join",
  "Project Update",
  "Hiring for Hackathon",
  "Final Year Project Need",
  "Open Source Collaboration",
  "Resource Share",
];

export default function CreatePost() {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<PostType>("Looking for Team");
  const [projectName, setProjectName] = useState("");
  const [domain, setDomain] = useState("");
  const [tech, setTech] = useState("");
  const [projectType, setProjectType] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const postTypes = useMemo(() => [
    "Looking for Team",
    "Seeking Contributor",
    "Open to Join",
    "Project Update",
    "Hiring for Hackathon",
    "Final Year Project Need",
    "Open Source Collaboration",
    "Resource Share",
  ] as PostType[], []);

  const handleImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!state.currentUser) return;
    const p = createPostDraft({
      authorId: state.currentUser.id,
      title,
      body,
      type,
      projectName,
      domain,
      tech: tech.split(",").map((s) => s.trim()).filter(Boolean),
      projectType,
      lookingFor: lookingFor.split(",").map((s) => s.trim()).filter(Boolean),
      referenceLink,
      imageUrl,
    });
    dispatch({ type: "createPost", payload: p });
    setTitle(""); setBody(""); setTech(""); setDomain(""); setProjectType(""); setLookingFor(""); setReferenceLink(""); setImageUrl(""); setProjectName("");
  };

  if (!state.currentUser) {
    return (
      <div className="ds-card p-4 mb-4 text-sm text-muted-foreground">
        Log in to create collaboration posts and share what you need.
      </div>
    );
  }

  return (
    <div className="ds-card p-4 mb-4">
      <div className="flex gap-3">
        <div className="size-10 rounded-full bg-gradient-primary text-white flex items-center justify-center">{state.currentUser?.avatar || ""}</div>
        <div className="flex-1">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title or headline" className="ds-input mb-2" />
          <RichTextEditor value={body} onChange={setBody} placeholder="Describe what you're looking for..." className="mb-2" />
          <div className="flex gap-2 items-center">
            <select aria-label="Post type" value={type} onChange={(e) => setType(e.target.value as PostType)} className="ds-input w-auto">
              {postTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Domain (e.g., Frontend)" className="ds-input w-48" />
            <input value={tech} onChange={(e) => setTech(e.target.value)} placeholder="Tech (comma-separated)" className="ds-input w-48" />
              <button onClick={submit} className="h-10 px-4 rounded-xl bg-primary text-white">Post</button>
          </div>
            <div className="mt-2 grid md:grid-cols-2 gap-2">
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name (e.g. DevSync Team Match AI)" className="ds-input" />
              <input value={projectType} onChange={(e) => setProjectType(e.target.value)} placeholder="Project type (Hackathon, FYP, Open Source)" className="ds-input" />
              <input value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="Looking for (Frontend, Designer, ML…)" className="ds-input" />
              <input value={referenceLink} onChange={(e) => setReferenceLink(e.target.value)} placeholder="Reference link (optional)" className="ds-input" />
              <label className="h-11 px-4 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center gap-2 cursor-pointer hover:bg-secondary col-span-2">
                <Link className="size-4" />
                Add image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} />
              </label>
            </div>
            {imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-border bg-surface-alt">
                <img src={imageUrl} alt="Post preview" className="w-full max-h-64 object-cover" />
                <div className="p-2 flex justify-end">
                  <button onClick={() => setImageUrl("")} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Remove image</button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
