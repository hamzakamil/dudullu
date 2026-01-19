# Ödeme Entegrasyonu Dokümantasyonu

Bu dokümantasyon, iyizico, sipay ve kuveyt türk online pos entegrasyonunun nasıl yapılandırılacağını açıklar.

## Özellikler

- ✅ İyizico ödeme entegrasyonu
- ✅ Sipay ödeme entegrasyonu
- ✅ Kuveyt Türk Online POS entegrasyonu
- ✅ 3D Secure desteği
- ✅ Taksit seçenekleri
- ✅ Güvenli ödeme işlemi

## Kurulum

### 1. Frontend Entegrasyonu

Frontend entegrasyonu zaten `index.html` dosyasına eklenmiştir. Kullanıcılar "Kredi Kartı ile Ödeme" sekmesine tıklayarak ödeme sağlayıcısını seçebilirler.

### 2. Backend Entegrasyonu

Backend entegrasyonu için `backend-payment-integration-example.js` dosyasını referans alarak kendi backend'inizi oluşturun.

#### Gerekli Paketler

```bash
npm install express axios crypto
```

#### Environment Variables

`.env` dosyanıza aşağıdaki değişkenleri ekleyin:

```env
# İyizico
IYIZICO_API_KEY=your_iyizico_api_key
IYIZICO_SECRET_KEY=your_iyizico_secret_key
IYIZICO_BASE_URL=https://api.iyizico.com

# Sipay
SIPAY_MERCHANT_KEY=your_sipay_merchant_key
SIPAY_MERCHANT_ID=your_sipay_merchant_id
SIPAY_BASE_URL=https://api.sipay.com.tr

# Kuveyt Türk
KUVEYT_TURK_MERCHANT_ID=your_kuveyt_turk_merchant_id
KUVEYT_TURK_CUSTOMER_ID=your_kuveyt_turk_customer_id
KUVEYT_TURK_USERNAME=your_kuveyt_turk_username
KUVEYT_TURK_PASSWORD=your_kuveyt_turk_password
KUVEYT_TURK_BASE_URL=https://boa.kuveytturk.com.tr/sanalposservice/Home/ThreeDModelPayGate
```

## API Endpoint'leri

### İyizico Ödeme

**Endpoint:** `POST /api/payment/iyizico`

**Request Body:**
```json
{
  "locale": "tr",
  "conversationId": "CONV-123456",
  "price": "100.00",
  "paidPrice": "100.00",
  "currency": "TRY",
  "installment": 1,
  "basketId": "BASKET-123456",
  "paymentCard": {
    "cardHolderName": "John Doe",
    "cardNumber": "5528790000000008",
    "expireMonth": "12",
    "expireYear": "2025",
    "cvc": "123"
  },
  "buyer": {
    "id": "BUYER-123456",
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "phoneNumber": "5551234567"
  },
  "basketItems": [
    {
      "id": "BAGIS001",
      "name": "Bağış",
      "category1": "Bağış",
      "itemType": "PHYSICAL",
      "price": "100.00"
    }
  ]
}
```

### Sipay Ödeme

**Endpoint:** `POST /api/payment/sipay`

**Request Body:**
```json
{
  "amount": "100.00",
  "currency": "TRY",
  "installment": 1,
  "card_number": "5528790000000008",
  "card_expiry_month": "12",
  "card_expiry_year": "2025",
  "card_cvv": "123",
  "card_holder_name": "John Doe",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "5551234567",
  "order_id": "ORDER-123456",
  "order_description": "Bağış"
}
```

### Kuveyt Türk Ödeme

**Endpoint:** `POST /api/payment/kuveytturk`

**Request Body:**
```json
{
  "CardNumber": "5528790000000008",
  "CardExpireDateMonth": "12",
  "CardExpireDateYear": "2025",
  "CardCVV2": "123",
  "CardHolderName": "John Doe",
  "Amount": "100.00",
  "Currency": "0949",
  "InstallmentCount": 1,
  "OrderId": "ORDER-123456",
  "CustomerName": "John Doe",
  "CustomerEmail": "john@example.com",
  "CustomerPhone": "5551234567",
  "OkUrl": "https://yoursite.com/payment/callback",
  "FailUrl": "https://yoursite.com/payment/fail"
}
```

## Güvenlik Önerileri

1. **API Anahtarları:** API anahtarlarınızı asla frontend kodunda saklamayın. Sadece backend'de kullanın.

2. **HTTPS:** Tüm ödeme işlemlerini HTTPS üzerinden yapın.

3. **Veri Doğrulama:** Tüm gelen verileri backend'de doğrulayın.

4. **Rate Limiting:** API endpoint'lerinize rate limiting ekleyin.

5. **Loglama:** Tüm ödeme işlemlerini loglayın (kart bilgileri hariç).

6. **PCI DSS:** PCI DSS uyumluluğu için gerekli önlemleri alın.

## Test Kartları

### İyizico Test Kartları
- **Başarılı:** 5528790000000008
- **Başarısız:** 5528790000000016

### Sipay Test Kartları
- Test kartları için Sipay dokümantasyonuna bakın.

### Kuveyt Türk Test Kartları
- Test kartları için Kuveyt Türk dokümantasyonuna bakın.

## Hata Yönetimi

Tüm ödeme işlemlerinde hata durumları yakalanmalı ve kullanıcıya anlaşılır mesajlar gösterilmelidir.

## Destek

Herhangi bir sorunuz için:
- İyizico: https://dev.iyzipay.com/tr
- Sipay: https://www.sipay.com.tr/destek
- Kuveyt Türk: https://www.kuveytturk.com.tr/kurumsal-banking/sanal-pos
