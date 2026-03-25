#!/bin/bash

IMAGE_DIR="$(pwd)/assets/images"
BASE_IMAGE="$IMAGE_DIR/imageBase.png"

if [[ ! -f "$BASE_IMAGE" ]]; then
    echo "ERRO: imageBase.png não encontrada em $BASE_IMAGE"
    exit 1
fi

# Lista exata de arquivos a substituir
files=(
android-icon-background.png
android-icon-foreground.png
android-icon-monochrome.png
favicon.png
notification-icon.png
icon.png
splash-icon.png
)

for arquivo in "${files[@]}"; do
    TARGET="$IMAGE_DIR/$arquivo"

    if [[ -f "$TARGET" ]]; then
        rm "$TARGET"
        cp "$BASE_IMAGE" "$TARGET"
        echo "Substituído: $arquivo"
    else
        echo "AVISO: arquivo não encontrado e será criado: $arquivo"
        cp "$BASE_IMAGE" "$TARGET"
    fi
done
