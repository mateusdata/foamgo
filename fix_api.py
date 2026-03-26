import os

def process_file(filepath):
    with open(filepath, 'r') as file:
        content = file.read()
    
    new_content = content.replace("`/users/${user?.id}`", "'/users'")
    new_content = new_content.replace('`/users/${user?.id}`', "'/users'") 

    if new_content != content:
        with open(filepath, 'w') as file:
            file.write(new_content)
        print(f"Updated api endpoints in {filepath}")

for root, _, files in os.walk('/home/data/projects/foamgo/src/app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
