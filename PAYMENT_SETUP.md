# PK Mart — Payment Integration Setup Guide

## Installed Packages
```
pip install flask flask-sqlalchemy werkzeug stripe requests
```

---

## 1. Stripe (Visa / Mastercard)

1. Sign up at https://stripe.com
2. Go to **Developers → API Keys**
3. Copy your **Publishable Key** and **Secret Key**
4. Set environment variables:

```bash
export STRIPE_SECRET_KEY="sk_live_..."
export STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

> Use `sk_test_` / `pk_test_` keys for testing — no real charges.

---

## 2. JazzCash

1. Register as a merchant at https://sandbox.jazzcash.com.pk
2. Get your **Merchant ID**, **Password**, and **Integrity Salt**
3. Set environment variables:

```bash
export JAZZCASH_MERCHANT_ID="your_merchant_id"
export JAZZCASH_PASSWORD="your_password"
export JAZZCASH_INTEGRITY_SALT="your_salt"
```

4. In `app.py`, change `JAZZCASH_URL` to the **production URL** when going live:
   ```
   https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction
   ```

---

## 3. EasyPaisa

1. Register at https://easypaisa.com.pk/merchant or contact Telenor Microfinance Bank
2. Get your **Store ID**, **Hash Key**, **Username**, **Password**
3. Set environment variables:

```bash
export EASYPAISA_STORE_ID="your_store_id"
export EASYPAISA_HASH_KEY="your_hash_key"
export EASYPAISA_USERNAME="your_username"
export EASYPAISA_PASSWORD="your_password"
```

4. In `app.py`, change the EasyPaisa URL to production when going live:
   ```
   https://easypay.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction
   ```

---

## Running the App

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000

---

## Payment Flow Summary

| Method       | Flow |
|-------------|------|
| COD          | Order saved immediately with status `pending` |
| Stripe       | Card tokenized in browser → backend charges → status `paid` |
| JazzCash     | Backend calls API → push notification sent to customer's phone |
| EasyPaisa    | Backend calls API → push notification sent to customer's phone |

All orders are saved to `instance/pkmart.db` (SQLite) with full details.

---

## API Endpoints Added

| Route | Method | Description |
|-------|--------|-------------|
| `/api/pay/cod` | POST | Place COD order |
| `/api/pay/stripe` | POST | Charge card via Stripe |
| `/api/pay/jazzcash` | POST | Pay via JazzCash wallet |
| `/api/pay/easypaisa` | POST | Pay via EasyPaisa wallet |
| `/api/jazzcash/callback` | POST | JazzCash webhook |
| `/api/easypaisa/callback` | POST | EasyPaisa webhook |
| `/api/order/<ref>` | GET | Check order status |
