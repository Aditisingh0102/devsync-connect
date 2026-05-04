import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";

export default function AvatarUpload({ userId }: { userId: string }) {
  const { state, dispatch } = useApp();
  const user = state.users[userId] || state.currentUser;
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!user) return;
    const updated = { ...user, avatar: preview || user.avatar };
    dispatch({ type: "updateUser", payload: updated });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="h-9 px-3 rounded-xl bg-card border border-border text-sm">Edit Photo</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload profile photo</DialogTitle>
          <DialogDescription>Choose a clear photo so teammates recognize you.</DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col items-center gap-4">
          <div className="size-24 rounded-2xl bg-surface flex items-center justify-center overflow-hidden">
            {preview ? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : <div className="text-muted-foreground">{(user?.name||"U").split(" ").map((s:any)=>s[0]).slice(0,2).join("")}</div>}
          </div>

          <label className="h-10 px-4 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center justify-center cursor-pointer hover:bg-secondary">
            Choose file
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=> onFile(e.target.files?.[0])} />
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="h-10 px-4 rounded-xl bg-primary text-white">Save</button>
            <button onClick={()=>{ setPreview(null); if (fileRef.current) fileRef.current.value = ""; setOpen(false); }} className="h-10 px-4 rounded-xl bg-card border">Cancel</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
