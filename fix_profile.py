import re

with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix modal config state
if 'setModalConfig' not in content:
    content = content.replace(
        '  const completion = 78;',
        '  const completion = 78;\n  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: "followers" | "following"}>({isOpen: false, type: "followers"});'
    )

# Fix grid 4 button clicks
old_btn = """          <button key={k} className="ds-card p-5 text-left hover:bg-secondary transition-colors">"""
new_btn = """          <button 
            key={k} 
            onClick={() => {
              if (k === "followers" || k === "following") {
                setModalConfig({ isOpen: true, type: k as "followers" | "following" });
              }
            }}
            className="ds-card p-5 text-left hover:bg-secondary transition-colors"
          >"""

if 'if (k === "followers" || k === "following")' not in content:
    content = content.replace(old_btn, new_btn)

# Fix network tab clicks
old_net_foll = """          <div className="ds-card p-6">
            <div className="flex items-center gap-2 text-primary mb-2"><Users className="size-4" /><h3 className="font-semibold text-lg">Followers</h3></div>"""
new_net_foll = """          <div onClick={() => setModalConfig({isOpen: true, type: "followers"})} className="ds-card p-6 cursor-pointer hover:bg-secondary transition-colors">
            <div className="flex items-center gap-2 text-primary mb-2"><Users className="size-4" /><h3 className="font-semibold text-lg">Followers</h3></div>"""

old_net_following = """          <div className="ds-card p-6">
            <div className="flex items-center gap-2 text-primary mb-2"><Send className="size-4" /><h3 className="font-semibold text-lg">Following</h3></div>"""
new_net_following = """          <div onClick={() => setModalConfig({isOpen: true, type: "following"})} className="ds-card p-6 cursor-pointer hover:bg-secondary transition-colors">
            <div className="flex items-center gap-2 text-primary mb-2"><Send className="size-4" /><h3 className="font-semibold text-lg">Following</h3></div>"""

if 'type: "followers"})' not in content:
    content = content.replace(old_net_foll, new_net_foll)
    content = content.replace(old_net_following, new_net_following)

# Fix FollowListModal import and component
if 'import FollowListModal' not in content:
    content = content.replace('import PostCard from "@/components/PostCard";', 'import PostCard from "@/components/PostCard";\nimport FollowListModal from "@/components/FollowListModal";')

old_modal = """    </div>
  );
}"""

new_modal = """      <FollowListModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        username={profile?.username}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}"""

if '<FollowListModal' not in content:
    content = content.replace(old_modal, new_modal)

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
