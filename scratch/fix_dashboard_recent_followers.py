import re

target_file = r'C:\Users\aditi\Desktop\devsync-backend-FastAPI\app\features\dashboard\router.py'
with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

old_recent = '''    # Mock recent followers for now (we'd need a follower table otherwise)
    recent_followers = []'''

new_recent = '''    # Get recent followers
    recent_followers_result = await db.execute(
        select(User)
        .join(user_follows, user_follows.c.follower_id == User.id)
        .where(user_follows.c.followed_id == current_user.id)
        .limit(3)
    )
    recent_followers = recent_followers_result.scalars().all()'''

content = content.replace(old_recent, new_recent)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)
