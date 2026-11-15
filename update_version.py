import json

ver = input("Enter new version: ")

with open("package.json", "r", encoding="UTF-8") as f:
    data = json.load(f)

data["version"] = ver
with open("package.json", "w", encoding="UTF-8") as f:
    json.dump(data, f, indent=2)

with open("src/ui.ts", "r", encoding="UTF-8") as f:
    lines = f.readlines()
    targe_idx = 0
    for i, line in enumerate(lines):
        if line.startswith("const VERSION"):
            targe_idx = i
            break

    lines[targe_idx] = f'const VERSION="{ver}";\n'

with open("src/ui.ts", "w", encoding="UTF-8") as f:
    f.writelines(lines)

with open("manifest.json", "r", encoding="UTF-8") as f:
    data = json.load(f)

data["version"] = ver
with open("manifest.json", "w", encoding="UTF-8") as f:
    json.dump(data, f, indent=4)
