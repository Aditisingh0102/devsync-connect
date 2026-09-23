import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix imports
if 'FollowListModal' not in content:
    content = content.replace(
        'import { Link, useLocation } from "react-router-dom";',
        'import { Link, useLocation } from "react-router-dom";\nimport FollowListModal from "@/components/FollowListModal";'
    )

# Fix state
if 'setModalConfig' not in content:
    content = content.replace(
        '  const [followedBack, setFollowedBack] = useState<number[]>([]);',
        '  const [followedBack, setFollowedBack] = useState<number[]>([]);\n  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: "followers" | "following"}>({isOpen: false, type: "followers"});'
    )

# Fix clickable stats
old_stats = """            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat title="Posts" value={postCount} icon={ClipboardList} />
              <Stat title="Followers" value={followerCount} icon={Users} />
              <Stat title="Following" value={followingCount} icon={UserPlus} />
              <Stat title="Pending Requests" value={pendingRequestCount} icon={Bell} />
            </div>"""

new_stats = """            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat title="Posts" value={postCount} icon={ClipboardList} />
              <div onClick={() => setModalConfig({isOpen: true, type: "followers"})} className="cursor-pointer transition-transform active:scale-95">
                <Stat title="Followers" value={followerCount} icon={Users} />
              </div>
              <div onClick={() => setModalConfig({isOpen: true, type: "following"})} className="cursor-pointer transition-transform active:scale-95">
                <Stat title="Following" value={followingCount} icon={UserPlus} />
              </div>
              <Stat title="Pending Requests" value={pendingRequestCount} icon={Bell} />
            </div>"""

if 'setModalConfig({isOpen: true, type: "followers"})' not in content:
    # Need to handle exact spacing just in case
    content = re.sub(
        r'<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">.*?<Stat title="Pending Requests" value=\{pendingRequestCount\} icon=\{Bell\} />\s*</div>',
        new_stats,
        content,
        flags=re.DOTALL
    )

# Fix modal element
old_modal = """    </div>
  );
}"""

new_modal = """      <FollowListModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        username={me?.username}
        isOwnProfile={true}
      />
    </div>
  );
}"""

if '<FollowListModal' not in content:
    content = content.replace(old_modal, new_modal)

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
