import re

target_file = r'C:\Users\aditi\Desktop\devsync-connect\src\pages\ProfilePosts.tsx'
with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { toast } from "sonner"' not in content:
    content = content.replace(
        'import PostCard from "@/components/PostCard";',
        'import PostCard from "@/components/PostCard";\nimport { Skeleton } from "@/components/ui/skeleton";\nimport { toast } from "sonner";'
    )

content = content.replace(
    '.catch(console.error).finally(() => setLoading(false));',
    '.catch((err) => { console.error(err); toast.error("Failed to load posts."); }).finally(() => setLoading(false));'
)

skeleton_loader = '''        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="ds-card p-5 space-y-4 h-[300px]">
              <div className="flex gap-3 items-center">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>'''

content = content.replace(
    '<div className="h-60 flex items-center justify-center">\n          <Loader2 className="size-8 animate-spin text-primary" />\n        </div>',
    skeleton_loader
)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)
