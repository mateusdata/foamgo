
# Remove all console statements

## console.log()

```bash
find . -type f \
  \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -exec sed -i '/console[ ]*\.[ ]*log[ ]*(/d' {} +
```

## console.error()

```bash
find . -type f \
  \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -exec sed -i '/console[ ]*\.[ ]*error[ ]*(/d' {} +
```

