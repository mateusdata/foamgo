# Build and Run Commands

## Android

### Build local
```bash
eas build --local --platform android --profile development
```

### Build remote
```bash
eas build --platform android --profile development
```

### Install App
```bash
bunx expo run:android --variant release -d
```

## iOS

### Build local
```bash
eas build --local --platform ios --profile development
```

### Build remote
```bash
eas build --platform ios --profile development
```

### Install App
```bash
bunx expo run:ios --configuration Release --device
```

## Production Builds

### Build all platforms
```bash
eas build --profile production --platform all
```

## Updates

### Create update
```bash
eas update --branch production --message "mensagem" --platform all
```

### List updates
```bash
eas update:list --branch production --json
```

### Delete update
```bash
eas update:delete GROUPID --non-interactive
```

### Rollback to embedded
```bash
eas update:roll-back-to-embedded --branch production --message "mensagem" --runtime-version "1.0.0" --non-interactive
```

### List branches
```bash
eas branch:list --json
```

## Android Signing Report
```bash
cd android && ./gradlew signingReport
```

## Web Export
```bash
npx expo export -p web
eas deploy --prod
```


# Base65 for envs
gzip -c GoogleService-Info.plist | base64 -w 0 > ios_gzip_base64.txt

gzip -c google-services.json | base64 -w 0 > android_gzip_base64.txt