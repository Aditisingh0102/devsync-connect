import re

target_file = r'C:\Users\aditi\Desktop\devsync-connect\src\pages\Requests.tsx'
with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { toast } from "sonner"' not in content:
    content = content.replace(
        'import { api, getToken } from "@/lib/api";',
        'import { api, getToken } from "@/lib/api";\nimport { Skeleton } from "@/components/ui/skeleton";\nimport { toast } from "sonner";'
    )

content = content.replace(
    'console.error(err);\n    }',
    'console.error(err);\n      toast.error("Action failed. Please try again.");\n    }'
)
content = content.replace(
    'setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));',
    'setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));\n      toast.success(`Request ${status} successfully.`);'
)

skeleton_loader = '''      <div className="container py-20 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="ds-card p-4 flex gap-4">
            <Skeleton className="size-11 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>'''

content = content.replace(
    '<div className="container py-20 flex items-center justify-center">\n        <Loader2 className="size-8 animate-spin text-primary" />\n      </div>',
    skeleton_loader
)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)
