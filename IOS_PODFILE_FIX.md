# Correção do Podfile para iOS (GoogleUtilities & RecaptchaInterop)

Toda vez que você executa o `bunx expo prebuild` (ou `bunx expo prebuild --clean`), a pasta `ios/` é regerada do zero pelo Expo e o arquivo `ios/Podfile` perde as configurações personalizadas.

Devido à dependência do Swift (`AppCheckCore` usado pelo Google Sign-In), o CocoaPods exige que as bibliotecas nativas `GoogleUtilities` e `RecaptchaInterop` tenham cabeçalhos modulares ativos (*modular headers*).

---

## 🛠️ O que precisa ser adicionado no `ios/Podfile`

Dentro do arquivo `ios/Podfile`, no bloco `target 'foamgo' do`, adicione as seguintes linhas:

```ruby
target 'foamgo' do
  pod 'GoogleUtilities', :modular_headers => true
  pod 'RecaptchaInterop', :modular_headers => true
  use_expo_modules!
  ...
```

---

## ⚡ Automação Via Terminal (macOS)

Você pode aplicar essa alteração automaticamente após qualquer `expo prebuild` executando este comando no terminal:

```bash
sed -i '' "/target 'foamgo' do/a\\
  pod 'GoogleUtilities', :modular_headers => true\\
  pod 'RecaptchaInterop', :modular_headers => true
" ios/Podfile
```

---

## 🚀 Fluxo Recomendado para o Prebuild iOS

Para regerar os arquivos nativos do iOS e rodar o `pod install` sem erros:

```bash
# 1. Regerar o projeto nativo do iOS
bunx expo prebuild -p ios

# 2. Injetar a correção no Podfile
sed -i '' "/target 'foamgo' do/a\\
  pod 'GoogleUtilities', :modular_headers => true\\
  pod 'RecaptchaInterop', :modular_headers => true
" ios/Podfile

# 3. Atualizar e instalar os Pods
cd ios && pod install --repo-update && cd ..
```
