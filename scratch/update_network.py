import re

target_file = r'C:\Users\aditi\Desktop\devsync-connect\src\pages\ProfileNetwork.tsx'
with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Skeleton and toast imports
if 'import { toast } from "sonner"' not in content:
    content = content.replace(
        'import { Avatar, AvatarFallback } from "@/components/ui/avatar";',
        'import { Avatar, AvatarFallback } from "@/components/ui/avatar";\nimport { Skeleton } from "@/components/ui/skeleton";\nimport { toast } from "sonner";'
    )

# Fix fetch promise catch
content = content.replace(
    '.catch((err) => console.error(err))',
    '.catch((err) => { console.error(err); toast.error("Failed to load network data."); })'
)

# Add toasts to optimistic updates
content = content.replace(
    'setUsers(prev => prev.filter(u => u.id !== userId));\n      } else {',
    'setUsers(prev => prev.filter(u => u.id !== userId));\n        toast.success("Follower removed successfully.");\n      } else {'
)
content = content.replace(
    'setUsers(prev => prev.filter(u => u.id !== userId));\n    } catch (error)',
    'setUsers(prev => prev.filter(u => u.id !== userId));\n        toast.success(`Unfollowed @${username}.`);\n    } catch (error)'
)
content = content.replace(
    'console.error(error);\n    } finally',
    'console.error(error);\n      toast.error("An error occurred. Please try again.");\n    } finally'
)

# Replace loader with Skeleton
skeleton_loader = '''          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/50">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-9 w-20 rounded-lg" />
              </div>
            ))}
          </div>'''

content = content.replace(
    '<div className="h-60 flex items-center justify-center">\n            <Loader2 className="size-8 animate-spin text-primary" />\n          </div>',
    skeleton_loader
)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)
