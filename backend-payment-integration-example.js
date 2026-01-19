/**
 * Backend Ödeme Entegrasyonu Örneği
 * 
 * Bu dosya, iyizico, sipay ve kuveyt türk online pos entegrasyonu için
 * backend API endpoint'lerinin nasıl oluşturulacağını gösterir.
 * 
 * NOT: Bu dosya sadece örnek amaçlıdır. Gerçek uygulamada:
 * - API anahtarları environment variables'da saklanmalı
 * - Güvenlik önlemleri alınmalı
 * - Hata yönetimi yapılmalı
 * - Loglama eklenmeli
 */

// Express.js örneği
const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// ============================================
// İYİZİCO ENTEGRASYONU
// ============================================
router.post('/api/payment/iyizico', async (req, res) => {
    try {
        const {
            locale,
            conversationId,
            price,
            paidPrice,
            currency,
            installment,
            basketId,
            paymentCard,
            buyer,
            billingAddress,
            shippingAddress,
            basketItems
        } = req.body;

        // İyizico API bilgileri (Environment variables'dan alınmalı)
        const IYIZICO_API_KEY = process.env.IYIZICO_API_KEY;
        const IYIZICO_SECRET_KEY = process.env.IYIZICO_SECRET_KEY;
        const IYIZICO_BASE_URL = process.env.IYIZICO_BASE_URL || 'https://api.iyizico.com';

        // İyizico için gerekli header'ları oluştur
        const randomString = crypto.randomBytes(16).toString('hex');
        const timestamp = Date.now().toString();
        const signature = createIyizicoSignature(
            IYIZICO_API_KEY,
            IYIZICO_SECRET_KEY,
            randomString,
            timestamp
        );

        // İyizico API'ye istek gönder
        const response = await axios.post(
            `${IYIZICO_BASE_URL}/api/payment/3d/initialize`,
            {
                locale,
                conversationId,
                price,
                paidPrice,
                currency,
                installment,
                basketId,
                paymentCard,
                buyer,
                billingAddress,
                shippingAddress,
                basketItems
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `IYZWS ${IYIZICO_API_KEY}:${signature}`,
                    'x-iyzi-rnd': randomString,
                    'x-iyzi-client-version': 'iyzipay-node-2.0.48'
                }
            }
        );

        if (response.data.status === 'success') {
            res.json({
                status: 'success',
                htmlContent: response.data.threeDSHtmlContent,
                conversationId: response.data.conversationId,
                paymentId: response.data.paymentId
            });
        } else {
            res.status(400).json({
                status: 'error',
                errorMessage: response.data.errorMessage || 'İyizico ödeme işlemi başarısız'
            });
        }
    } catch (error) {
        console.error('İyizico ödeme hatası:', error);
        res.status(500).json({
            status: 'error',
            errorMessage: error.message || 'Ödeme işlemi sırasında bir hata oluştu'
        });
    }
});

// İyizico signature oluşturma
function createIyizicoSignature(apiKey, secretKey, randomString, timestamp) {
    const hashString = apiKey + randomString + timestamp + secretKey;
    return crypto.createHash('sha256').update(hashString).digest('base64');
}

// ============================================
// SİPAY ENTEGRASYONU
// ============================================
router.post('/api/payment/sipay', async (req, res) => {
    try {
        const {
            amount,
            currency,
            installment,
            card_number,
            card_expiry_month,
            card_expiry_year,
            card_cvv,
            card_holder_name,
            customer_name,
            customer_email,
            customer_phone,
            order_id,
            order_description,
            return_url,
            cancel_url
        } = req.body;

        // Sipay API bilgileri (Environment variables'dan alınmalı)
        const SIPAY_MERCHANT_KEY = process.env.SIPAY_MERCHANT_KEY;
        const SIPAY_MERCHANT_ID = process.env.SIPAY_MERCHANT_ID;
        const SIPAY_BASE_URL = process.env.SIPAY_BASE_URL || 'https://api.sipay.com.tr';

        // Sipay için hash oluştur
        const hashString = `${SIPAY_MERCHANT_KEY}${amount}${currency}${order_id}${SIPAY_MERCHANT_ID}`;
        const hash = crypto.createHash('sha256').update(hashString).digest('hex');

        // Sipay API'ye istek gönder
        const response = await axios.post(
            `${SIPAY_BASE_URL}/api/payment/process`,
            {
                merchant_key: SIPAY_MERCHANT_KEY,
                merchant_id: SIPAY_MERCHANT_ID,
                amount,
                currency,
                installment,
                card_number,
                card_expiry_month,
                card_expiry_year,
                card_cvv,
                card_holder_name,
                customer_name,
                customer_email,
                customer_phone,
                order_id,
                order_description,
                return_url,
                cancel_url,
                hash
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status === 'success') {
            res.json({
                status: 'success',
                redirect_url: response.data.redirect_url,
                transaction_id: response.data.transaction_id
            });
        } else {
            res.status(400).json({
                status: 'error',
                error_message: response.data.error_message || 'Sipay ödeme işlemi başarısız'
            });
        }
    } catch (error) {
        console.error('Sipay ödeme hatası:', error);
        res.status(500).json({
            status: 'error',
            error_message: error.message || 'Ödeme işlemi sırasında bir hata oluştu'
        });
    }
});

// ============================================
// KUVEYT TÜRK ONLINE POS ENTEGRASYONU
// ============================================
router.post('/api/payment/kuveytturk', async (req, res) => {
    try {
        const {
            CardNumber,
            CardExpireDateMonth,
            CardExpireDateYear,
            CardCVV2,
            CardHolderName,
            Amount,
            Currency,
            InstallmentCount,
            OrderId,
            CustomerName,
            CustomerEmail,
            CustomerPhone,
            OkUrl,
            FailUrl
        } = req.body;

        // Kuveyt Türk API bilgileri (Environment variables'dan alınmalı)
        const KUVEYT_TURK_MERCHANT_ID = process.env.KUVEYT_TURK_MERCHANT_ID;
        const KUVEYT_TURK_CUSTOMER_ID = process.env.KUVEYT_TURK_CUSTOMER_ID;
        const KUVEYT_TURK_USERNAME = process.env.KUVEYT_TURK_USERNAME;
        const KUVEYT_TURK_PASSWORD = process.env.KUVEYT_TURK_PASSWORD;
        const KUVEYT_TURK_BASE_URL = process.env.KUVEYT_TURK_BASE_URL || 
            'https://boa.kuveytturk.com.tr/sanalposservice/Home/ThreeDModelPayGate';

        // Kuveyt Türk için hash oluştur
        const hashString = `${KUVEYT_TURK_MERCHANT_ID}${OrderId}${Amount}${OkUrl}${FailUrl}${KUVEYT_TURK_USERNAME}${KUVEYT_TURK_PASSWORD}`;
        const hash = crypto.createHash('sha256').update(hashString).digest('hex');

        // Form HTML'i oluştur (Kuveyt Türk form gönderimi gerektirir)
        const formHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ödeme İşlemi</title>
            </head>
            <body>
                <form id="paymentForm" method="POST" action="${KUVEYT_TURK_BASE_URL}">
                    <input type="hidden" name="MerchantId" value="${KUVEYT_TURK_MERCHANT_ID}">
                    <input type="hidden" name="CustomerId" value="${KUVEYT_TURK_CUSTOMER_ID}">
                    <input type="hidden" name="UserName" value="${KUVEYT_TURK_USERNAME}">
                    <input type="hidden" name="Password" value="${KUVEYT_TURK_PASSWORD}">
                    <input type="hidden" name="CardNumber" value="${CardNumber}">
                    <input type="hidden" name="CardExpireDateMonth" value="${CardExpireDateMonth}">
                    <input type="hidden" name="CardExpireDateYear" value="${CardExpireDateYear}">
                    <input type="hidden" name="CardCVV2" value="${CardCVV2}">
                    <input type="hidden" name="CardHolderName" value="${CardHolderName}">
                    <input type="hidden" name="Amount" value="${Amount}">
                    <input type="hidden" name="Currency" value="${Currency}">
                    <input type="hidden" name="InstallmentCount" value="${InstallmentCount}">
                    <input type="hidden" name="OrderId" value="${OrderId}">
                    <input type="hidden" name="CustomerName" value="${CustomerName}">
                    <input type="hidden" name="CustomerEmail" value="${CustomerEmail}">
                    <input type="hidden" name="CustomerPhone" value="${CustomerPhone}">
                    <input type="hidden" name="OkUrl" value="${OkUrl}">
                    <input type="hidden" name="FailUrl" value="${FailUrl}">
                    <input type="hidden" name="Hash" value="${hash}">
                </form>
                <script>
                    document.getElementById('paymentForm').submit();
                </script>
            </body>
            </html>
        `;

        res.json({
            status: 'success',
            formHtml: formHtml,
            orderId: OrderId
        });
    } catch (error) {
        console.error('Kuveyt Türk ödeme hatası:', error);
        res.status(500).json({
            status: 'error',
            error_message: error.message || 'Ödeme işlemi sırasında bir hata oluştu'
        });
    }
});

// ============================================
// ÖDEME CALLBACK HANDLER
// ============================================
router.post('/payment/callback', async (req, res) => {
    try {
        // Ödeme başarılı olduğunda buraya yönlendirilir
        const { orderId, transactionId, status } = req.body;

        // Ödeme kaydını veritabanına kaydet
        // await savePaymentRecord(orderId, transactionId, status);

        res.json({
            success: true,
            message: 'Ödeme başarıyla tamamlandı',
            orderId,
            transactionId
        });
    } catch (error) {
        console.error('Callback hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Callback işlemi sırasında bir hata oluştu'
        });
    }
});

module.exports = router;
