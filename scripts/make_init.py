import os

paths = [
    r"e:\Sentinel-AI\backend\app\api\__init__.py",
    r"e:\Sentinel-AI\backend\app\api\v1\__init__.py",
    r"e:\Sentinel-AI\backend\app\api\v1\endpoints\__init__.py",
    r"e:\Sentinel-AI\backend\app\core\__init__.py",
    r"e:\Sentinel-AI\backend\app\db\__init__.py",
    r"e:\Sentinel-AI\backend\app\models\__init__.py",
    r"e:\Sentinel-AI\backend\app\repositories\__init__.py",
    r"e:\Sentinel-AI\backend\app\schemas\__init__.py",
    r"e:\Sentinel-AI\backend\app\services\__init__.py",
    r"e:\Sentinel-AI\backend\app\services\ai\__init__.py",
    r"e:\Sentinel-AI\backend\app\services\simulator\__init__.py",
    r"e:\Sentinel-AI\backend\app\websockets\__init__.py",
    r"e:\Sentinel-AI\backend\app\workers\__init__.py",
    r"e:\Sentinel-AI\backend\tests\__init__.py",
    r"e:\Sentinel-AI\backend\tests\unit\__init__.py",
    r"e:\Sentinel-AI\backend\tests\integration\__init__.py",
]

for p in paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'a').close()
    print(f"Created {p}")

print("All done.")
