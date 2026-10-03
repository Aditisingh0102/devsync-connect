import re

target_file = r'C:\Users\aditi\Desktop\devsync-backend-FastAPI\app\features\users\router.py'
with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'User.username == username',
    'func.lower(User.username) == func.lower(username)'
)

if 'from sqlalchemy import func' not in content:
    content = content.replace(
        'from sqlalchemy.future import select',
        'from sqlalchemy.future import select\nfrom sqlalchemy import func'
    )

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)
