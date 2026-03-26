import os

replacements = {
    "@/components/ThemedText": "@/components/themed-text",
    "@/components/ThemedView": "@/components/themed-view",
    "@/components/ThemedScrollView": "@/components/themed-scroll-view",
    "@/components/ThemedPressable": "@/components/themed-pressable",
    "@/components/AvatarUser": "@/components/avatar-user",
    "@/components/AvatarCompany": "@/components/avatar-company",
    "@/components/inputs/PaperInput": "@/components/inputs/paper-input",
    "@/components/buttons/PrimaryButton": "@/components/buttons/primary-button",
    "@/contexts/AuthProvider": "@/contexts/auth-provider",
    "@/components/AppTabs": "@/components/app-tabs"
}

def process_file(filepath):
    with open(filepath, 'r') as file:
        content = file.read()
    
    modified = False
    for old, new in replacements.items():
        if old in content:
            content = content.replace(old, new)
            modified = True
            
    if modified:
        with open(filepath, 'w') as file:
            file.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('/home/data/projects/foamgo/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
