# CV Analysis UI  

![React](https://img.shields.io/badge/React-19-61DAFB) ![Material_UI](https://img.shields.io/badge/MUI-v7-007FFF) ![Tailwind_CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4) ![i18next](https://img.shields.io/badge/i18n-Multi_Language-green)

### 🛠️ Bu proje aşağıdaki teknolojiler üzerine inşa edilmiştir (Bkz: `package.json`):

* **Core:** React 19, React Router DOM
* **UI Framework:** Material UI (MUI v7), Tailwind CSS
* **HTTP Client:** Axios (API Bağlantısı)
* **Araçlar:** React Dropzone (Dosya Yükleme), i18next (Çoklu Dil)
* **Test:** React Testing Library, Jest
---

## ⚙️ Kurulum ve Ayarlar

Projeyi çalıştırmadan önce aşağıdaki ayarları yapmanız gerekmektedir.

## 1. Bağımlılıkları Yükleme
Proje klasöründe terminali açın ve gerekli paketleri indirin:

```bash
npm install
```
## 2. Çalıştırma
Geliştirme sunucusunu başlatmak için:
```bash
npm start
```
Başarılı olduğunda tarayıcınız otomatik olarak http://localhost:3000 adresine yönlenecektir.

## 3.Uygulama Kullanımı ve Test Senaryosu
Arayüz açıldığında aşağıdaki adımları takip ederek sistemi test edebilirsiniz.
### Adım Adım Kullanım:
#### 1.Giriş Ekranı(Login) ve Kayıt Ol(Register)
* Tarayıcıda http://localhost:3000/ (login endpointi) açılır.
* Kayıt formunu kullanarak kayıt oluşturun.
* Başarılı girişte ve kayıt işleminde sistem JWT token'ı hafızaya alır ve ana sayfaya yönlendirir.

#### 2. Dosya Yükleme (Upload):
* Sürükle-Bırak alanına (react-dropzone) bir PDF veya Word dosyası bırakın veya açılır pencereden dosyanızı seçin.

*Not: Bu işlem sırasında Backend'e dosya gönderilir ve Gemini AI analizi beklenir.

#### 3.Sonuçları Görüntüleme (Modal):
* Analiz tamamlandığında sonuç ekranı belirir.

* AI tarafından verilen puanı, teknik yetkinlik analizini modal üzerinde inceleyin.

#### 4.Dil (i18n) ve Tema Değiştirme: 
* Sayfanın sol üst kısmındaki TR/EN butonuna tıklayarak sayfanın dilini değiştirebilir ve Güneş/Ay iconuna tıklayarak Koyu ve Aydınlık temalar arasında gezinebilirsiniz.

