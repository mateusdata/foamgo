import os
import re

def process_file(filepath):
    with open(filepath, 'r') as file:
        content = file.read()
    
    # Prefix /(client), /(team), /(partner) with /(app) 
    # Must use negative lookbehind to avoid /(app)/(app)/(client)
    new_content = re.sub(r'(?<!\/\(app\))\/\(client\)', r'/(app)/(client)', content)
    new_content = re.sub(r'(?<!\/\(app\))\/\(team\)', r'/(app)/(team)', new_content)
    new_content = re.sub(r'(?<!\/\(app\))\/\(partner\)', r'/(app)/(partner)', new_content)
    
    # Also handle some legacy routes mentioned in the tsc output
    new_content = new_content.replace("router.replace('/home')", "router.replace('/(app)/(partner)/(tabs)/companies')")
    new_content = new_content.replace("router.push('/store/subscription')", "router.push('/(app)/(partner)/(tabs)/companies')")
    new_content = new_content.replace("router.push('/agendamento')", "router.push('/(app)/(client)/(tabs)/bookings')")

    if new_content != content:
        with open(filepath, 'w') as file:
            file.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('/home/data/projects/foamgo/src/app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

for root, _, files in os.walk('/home/data/projects/foamgo/src/components'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
