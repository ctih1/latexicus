import json

ver = input("Enter new version")

with open("package.json", "r", encoding="UTF-8") as f:
    data = json.load(f)

data["version"] = ver
with open("package.json", "w", encoding="UTF-8") as f:
    json.dump(data, f, indent=2)

with open("src/ui.ts", "r", encoding="UTF-8") as f:
    lines = f.readlines()
    lines[0] = f'const VERSION="{ver}";'

with open("src/ui.ts", "w", encoding="UTF-8") as f:
    f.writelines(lines)

with open("manifest.json", "r", encoding="UTF-8") as f:
    data = json.load(f)

data["version"] = ver
with open("manifest.json", "w", encoding="UTF-8") as f:
    json.dump(data, f, indent=4)
