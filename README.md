# DistroCouple 🚀

DistroCouple, **Electron**, **React** ve **Vite** kullanılarak geliştirilmiş modern bir masaüstü uygulamasıdır. Arka uç servisleri için **Firebase** kullanır ve sistem izleme ile etkileşim için şık bir arayüz sunar.

## ✨ Özellikler

- **Modern Kullanıcı Arayüzü**: Akıcı animasyonlar için React ve Framer Motion kullanılarak oluşturuldu.
- **Sistem Bilgileri**: `systeminformation` kütüphanesi ile gerçek zamanlı sistem izleme.
- **Firebase Entegrasyonu**: Veri senkronizasyonu için güvenli arka uç bağlantısı.
- **Vite Gücü**: Çok hızlı geliştirme ve derleme süreci.

## 🛠️ Başlangıç

### Önkoşullar

- [Node.js](https://nodejs.org/) (v18 veya üstü sürüm önerilir)
- [Yarn](https://yarnpkg.com/) veya [npm](https://www.npmjs.com/)

### Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/miracthedevv/DistroCouple.git
   cd DistroCouple
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   yarn install
   # veya
   npm install
   ```

3. Firebase Yapılandırması:
   - `src/renderer/firebase.ts` dosyasını oluşturun.
   - Kendi Firebase yapılandırma anahtarlarınızı ekleyin

### Geliştirme

Geliştirme sunucusunu çalıştırın:
```bash
npm run dev
# veya
yarn dev
```

### Derleme

Uygulamayı paketlemek için:
```bash
npm run build
```

## 📂 Proje Yapısı

- `src/main`: Electron ana işlem (main process) dosyaları.
- `src/renderer`: React ön uç bileşenleri ve stilleri.
- `public`: Statik dosyalar.

## 📄 Lisans

Bu proje GPL v3.0 Lisansı ile lisanslanmıştır.
