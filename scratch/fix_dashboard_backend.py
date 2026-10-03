import re

target_file = r'C:\Users\aditi\Desktop\devsync-backend-FastAPI\app\features\dashboard\router.py'
with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'from app.features.users.models import User',
    'from app.features.users.models import User, user_follows'
)

new_counts = '''    # Counts
    posts_count = (await db.execute(select(func.count(Post.id)).where(Post.author_id == current_user.id))).scalar() or 0
    pending_requests_count = (await db.execute(select(func.count(Request.id)).where(Request.to_id == current_user.id, Request.status == "pending"))).scalar() or 0
    
    # Real data from backend db
    followers_count = (await db.execute(select(func.count()).select_from(user_follows).where(user_follows.c.followed_id == current_user.id))).scalar() or 0
    following_count = (await db.execute(select(func.count()).select_from(user_follows).where(user_follows.c.follower_id == current_user.id))).scalar() or 0
'''

# use re.sub for safety if hidden characters exist
content = re.sub(
    r'    # Counts.*?return \{',
    new_counts + '\n    return {',
    content,
    flags=re.DOTALL
)

old_return = '''    return {
        "posts_count": posts_count,
        "pending_requests_count": pending_requests_count,'''

new_return = '''    return {
        "posts_count": posts_count,
        "pending_requests_count": pending_requests_count,
        "followers_count": followers_count,
        "following_count": following_count,'''

content = content.replace(old_return, new_return)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)
