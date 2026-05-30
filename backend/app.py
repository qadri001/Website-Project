from flask import Flask, render_template, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import hashlib
import hmac
import time
import requests
import json
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'pkmart_secret_key_786'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pkmart.db'
db = SQLAlchemy(app)

# ============================================================
#  PAYMENT GATEWAY CREDENTIALS
#  Set these as environment variables before going live
# ============================================================
STRIPE_SECRET_KEY       = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_YOUR_STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY  = os.environ.get('STRIPE_PUBLISHABLE_KEY', 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY')

JAZZCASH_MERCHANT_ID    = os.environ.get('JAZZCASH_MERCHANT_ID', 'YOUR_JAZZCASH_MERCHANT_ID')
JAZZCASH_PASSWORD       = os.environ.get('JAZZCASH_PASSWORD', 'YOUR_JAZZCASH_PASSWORD')
JAZZCASH_INTEGRITY_SALT = os.environ.get('JAZZCASH_INTEGRITY_SALT', 'YOUR_JAZZCASH_INTEGRITY_SALT')
JAZZCASH_URL            = 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction'

EASYPAISA_STORE_ID      = os.environ.get('EASYPAISA_STORE_ID', 'YOUR_EASYPAISA_STORE_ID')
EASYPAISA_HASH_KEY      = os.environ.get('EASYPAISA_HASH_KEY', 'YOUR_EASYPAISA_HASH_KEY')
EASYPAISA_USERNAME      = os.environ.get('EASYPAISA_USERNAME', 'YOUR_EASYPAISA_USERNAME')
EASYPAISA_PASSWORD      = os.environ.get('EASYPAISA_PASSWORD', 'YOUR_EASYPAISA_PASSWORD')

# ============================================================
#  DATABASE MODELS
# ============================================================
class User(db.Model):
    id        = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100))
    email     = db.Column(db.String(100), unique=True, nullable=False)
    password  = db.Column(db.String(200), nullable=False)

class Order(db.Model):
    id             = db.Column(db.Integer, primary_key=True)
    order_ref      = db.Column(db.String(100), unique=True, nullable=False)
    full_name      = db.Column(db.String(100))
    email          = db.Column(db.String(100))
    mobile         = db.Column(db.String(20))
    address        = db.Column(db.Text)
    items          = db.Column(db.Text)
    total_amount   = db.Column(db.Integer)
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(30), default='pending')
    payment_ref    = db.Column(db.String(200))
    created_at     = db.Column(db.Integer, default=lambda: int(time.time()))

# ============================================================
#  PRODUCTS
# ============================================================
products_db = [
    # ── Laptops ──
    {"id": 1,  "name": "Dell XPS 13 Laptop",             "price": 185000, "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"},
    {"id": 2,  "name": "HP Spectre x360 Laptop",         "price": 165000, "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"},
    {"id": 3,  "name": "MacBook Air M2 Laptop",          "price": 245000, "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500"},
    {"id": 4,  "name": "Lenovo ThinkPad X1 Carbon",      "price": 210000, "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"},
    {"id": 5,  "name": "ASUS ROG Zephyrus G14",          "price": 230000, "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"},
    {"id": 6,  "name": "Microsoft Surface Pro 9",        "price": 195000, "image": "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500"},
    # ── Watches ──
    {"id": 7,  "name": "Premium Smart Watch",            "price":   8500, "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"},
    {"id": 8,  "name": "Luxury Leather Watch",           "price":  12500, "image": "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=500"},
    {"id": 9,  "name": "Samsung Galaxy Watch 6",         "price":  14500, "image": "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500"},
    {"id": 10, "name": "Apple Watch Series 9",           "price":  75000, "image": "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500"},
    {"id": 11, "name": "Garmin Fenix 7 Pro",             "price":  98000, "image": "https://images.unsplash.com/photo-1617625802912-cde586faf749?w=500"},
    # ── Mobiles ──
    {"id": 12, "name": "Samsung Galaxy S24",             "price": 185000, "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500"},
    {"id": 13, "name": "iPhone 15 Pro Mobile",           "price": 295000, "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600"},
    {"id": 14, "name": "Xiaomi 14 Ultra Mobile",         "price": 135000, "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"},
    {"id": 15, "name": "OnePlus 12 Mobile",              "price": 115000, "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500"},
    {"id": 16, "name": "Google Pixel 8 Pro",             "price": 175000, "image": "https://images.unsplash.com/photo-1598327105026-c3e34b2f5f2f?w=500"},
    {"id": 17, "name": "Vivo X100 Pro Mobile",           "price": 125000, "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500"},
    # ── Earbuds ──
    {"id": 18, "name": "Sony WH-1000XM5 Earbuds",       "price":  28500, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"},
    {"id": 19, "name": "Apple AirPods Pro 2 Earbuds",   "price":  32000, "image": "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600"},
    {"id": 20, "name": "JBL Tune Beam Earbuds",         "price":   8500, "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"},
    {"id": 21, "name": "Samsung Galaxy Buds2 Pro",      "price":  22000, "image": "https://images.unsplash.com/photo-1574920162043-b872873f19c8?w=500"},
    {"id": 22, "name": "Nothing Ear 2",                 "price":  18500, "image": "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=500"},
    # ── Power Banks ──
    {"id": 23, "name": "Anker 20000mAh Power Bank",     "price":   4500, "image": "https://images.pexels.com/photos/669228/pexels-photo-669228.jpeg?auto=compress&cs=tinysrgb&w=600"},
    {"id": 24, "name": "Xiaomi 30000mAh Power Bank",    "price":   6500, "image": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600"},
    {"id": 25, "name": "Samsung 25W Fast Power Bank",   "price":   5200, "image": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600"},
    {"id": 26, "name": "Baseus 65W GaN Power Bank",     "price":   7800, "image": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500"},
    # ── Tablets ──
    {"id": 27, "name": "iPad Pro 12.9 M2 Tablet",          "price": 195000, "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500"},
    {"id": 28, "name": "Samsung Galaxy Tab S9 Ultra Tablet","price": 165000, "image": "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500"},
    {"id": 29, "name": "Xiaomi Pad 6 Pro Tablet",           "price":  85000, "image": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500"},
    {"id": 33, "name": "iPad Air M1 Tablet",                "price": 155000, "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"},
    {"id": 34, "name": "OnePlus Pad 2 Tablet",              "price":  72000, "image": "https://images.unsplash.com/photo-1553341640-6b5f56d25ded?w=500"},
    {"id": 35, "name": "Lenovo Tab P12 Pro Tablet",         "price":  98000, "image": "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500"},
    # ── Cameras ──
    {"id": 30, "name": "Sony Alpha A7 IV Camera",       "price": 420000, "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"},
    {"id": 31, "name": "Canon EOS R6 Mark II Camera",   "price": 380000, "image": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500"},
    {"id": 32, "name": "GoPro Hero 12 Black Camera",    "price":  78000, "image": "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=500"},
]

# ============================================================
#  HELPERS
# ============================================================
def jazzcash_hash(params: dict) -> str:
    sorted_keys = sorted(params.keys())
    hash_string = JAZZCASH_INTEGRITY_SALT + '&' + '&'.join(params[k] for k in sorted_keys)
    return hmac.new(
        JAZZCASH_INTEGRITY_SALT.encode(),
        hash_string.encode(),
        hashlib.sha256
    ).hexdigest()

def normalize_mobile(mobile: str) -> str:
    m = mobile.replace('+', '').replace('-', '').replace(' ', '')
    if m.startswith('92') and len(m) == 12:
        m = '0' + m[2:]
    return m

# ============================================================
#  STANDARD ROUTES
# ============================================================
@app.route('/')
def home():
    return render_template('index.html', stripe_pub_key=STRIPE_PUBLISHABLE_KEY)

@app.route('/api/products')
def get_products():
    return jsonify(products_db)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    hashed_pw = generate_password_hash(data['password'])
    new_user = User(full_name=data['name'], email=data['email'], password=hashed_pw)
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"success": True, "message": "Account created!"})
    except:
        return jsonify({"success": False, "message": "Email already exists!"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        session['user'] = user.full_name
        return jsonify({"success": True, "message": f"Welcome {user.full_name}!"})
    return jsonify({"success": False, "message": "Invalid email or password!"})

# ============================================================
#  PAYMENT: Cash on Delivery
# ============================================================
@app.route('/api/pay/cod', methods=['POST'])
def pay_cod():
    data = request.json
    order_ref = 'PKM-' + str(uuid.uuid4())[:8].upper()
    order = Order(
        order_ref=order_ref,
        full_name=data.get('fullname'),
        email=data.get('email'),
        mobile=data.get('mobile'),
        address=data.get('address'),
        items=json.dumps(data.get('items', [])),
        total_amount=data.get('total'),
        payment_method='cod',
        payment_status='pending',
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({"success": True, "order_ref": order_ref,
                    "message": f"Order {order_ref} placed! Pay on delivery."})

# ============================================================
#  PAYMENT: Stripe
# ============================================================
@app.route('/api/pay/stripe', methods=['POST'])
def pay_stripe():
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY
    data = request.json
    order_ref = 'PKM-' + str(uuid.uuid4())[:8].upper()
    total_pkr = int(data.get('total', 0))
    try:
        intent = stripe.PaymentIntent.create(
            amount=total_pkr * 100,
            currency='pkr',
            description=f'PK Mart Order {order_ref}',
            metadata={'order_ref': order_ref, 'customer': data.get('fullname'), 'email': data.get('email')},
            payment_method=data.get('stripe_payment_method_id'),
            confirm=True,
            return_url=request.host_url + 'order-success',
        )
        status = 'paid' if intent.status == 'succeeded' else 'pending'
        order = Order(
            order_ref=order_ref, full_name=data.get('fullname'), email=data.get('email'),
            mobile=data.get('mobile'), address=data.get('address'),
            items=json.dumps(data.get('items', [])), total_amount=total_pkr,
            payment_method='stripe', payment_status=status, payment_ref=intent.id,
        )
        db.session.add(order)
        db.session.commit()
        return jsonify({"success": status == 'paid', "order_ref": order_ref,
                        "client_secret": intent.client_secret, "payment_status": intent.status,
                        "message": "Payment successful!" if status == 'paid' else "Payment requires further action."})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

# ============================================================
#  PAYMENT: JazzCash
# ============================================================
@app.route('/api/pay/jazzcash', methods=['POST'])
def pay_jazzcash():
    data = request.json
    order_ref = 'PKM' + str(uuid.uuid4())[:8].upper()
    total_pkr = int(data.get('total', 0))
    mobile_no = normalize_mobile(data.get('mobile', ''))
    txn_dt = time.strftime('%Y%m%d%H%M%S')
    expiry = time.strftime('%Y%m%d%H%M%S', time.localtime(time.time() + 3600))

    params = {
        'pp_Version': '2.0', 'pp_TxnType': 'MWALLET', 'pp_Language': 'EN',
        'pp_MerchantID': JAZZCASH_MERCHANT_ID, 'pp_SubMerchantID': '',
        'pp_Password': JAZZCASH_PASSWORD, 'pp_BankID': 'TBANK', 'pp_ProductID': 'RETL',
        'pp_TxnRefNo': order_ref, 'pp_Amount': str(total_pkr * 100),
        'pp_TxnCurrency': 'PKR', 'pp_TxnDateTime': txn_dt,
        'pp_BillReference': order_ref, 'pp_Description': 'PK Mart Purchase',
        'pp_TxnExpiryDateTime': expiry, 'pp_MobileNumber': mobile_no,
        'pp_CNIC': data.get('cnic', ''),
        'ppmpf_1': '', 'ppmpf_2': '', 'ppmpf_3': '', 'ppmpf_4': '', 'ppmpf_5': '',
    }
    hash_params = {k: v for k, v in params.items() if v}
    params['pp_SecureHash'] = jazzcash_hash(hash_params)

    try:
        resp = requests.post(JAZZCASH_URL, json=params, timeout=30)
        resp_data = resp.json()
        success = resp_data.get('pp_ResponseCode') == '000'
        order = Order(
            order_ref=order_ref, full_name=data.get('fullname'), email=data.get('email'),
            mobile=data.get('mobile'), address=data.get('address'),
            items=json.dumps(data.get('items', [])), total_amount=total_pkr,
            payment_method='jazzcash', payment_status='paid' if success else 'failed',
            payment_ref=resp_data.get('pp_TxnRefNo', ''),
        )
        db.session.add(order)
        db.session.commit()
        return jsonify({"success": success, "order_ref": order_ref,
                        "message": resp_data.get('pp_ResponseMessage', 'Transaction complete.'),
                        "gateway": resp_data})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

# ============================================================
#  PAYMENT: EasyPaisa
# ============================================================
@app.route('/api/pay/easypaisa', methods=['POST'])
def pay_easypaisa():
    data = request.json
    order_ref = 'PKM' + str(uuid.uuid4())[:8].upper()
    total_pkr = int(data.get('total', 0))
    mobile_no = normalize_mobile(data.get('mobile', ''))

    payload = {
        "storeId": EASYPAISA_STORE_ID,
        "amount": str(total_pkr),
        "postBackURL": request.host_url + 'api/easypaisa/callback',
        "orderRefNum": order_ref,
        "expiryDate": time.strftime('%Y%m%d%H%M%S', time.localtime(time.time() + 3600)),
        "paymentMethod": "MA",
        "supportedPaymentInstruments": "MA",
        "msisdn": mobile_no,
        "cnic": data.get('cnic', ''),
    }
    sorted_str = '&'.join(f"{k}={payload[k]}" for k in sorted(payload.keys()))
    payload['hash'] = hashlib.md5((sorted_str + EASYPAISA_HASH_KEY).encode()).hexdigest()

    headers = {'Content-Type': 'application/json',
               'username': EASYPAISA_USERNAME, 'password': EASYPAISA_PASSWORD}
    try:
        resp = requests.post(
            'https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction',
            json=payload, headers=headers, timeout=30)
        resp_data = resp.json()
        success = str(resp_data.get('responseCode', '')).strip() == '0000'
        order = Order(
            order_ref=order_ref, full_name=data.get('fullname'), email=data.get('email'),
            mobile=data.get('mobile'), address=data.get('address'),
            items=json.dumps(data.get('items', [])), total_amount=total_pkr,
            payment_method='easypaisa', payment_status='pending' if success else 'failed',
            payment_ref=resp_data.get('transactionId', ''),
        )
        db.session.add(order)
        db.session.commit()
        return jsonify({"success": success, "order_ref": order_ref,
                        "message": resp_data.get('responseDesc', 'Check your EasyPaisa app to approve.'),
                        "gateway": resp_data})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

# ============================================================
#  CALLBACKS (gateway webhooks)
# ============================================================
@app.route('/api/jazzcash/callback', methods=['POST'])
def jazzcash_callback():
    data = request.form.to_dict() or request.json or {}
    order = Order.query.filter_by(order_ref=data.get('pp_BillReference', '')).first()
    if order:
        order.payment_status = 'paid' if data.get('pp_ResponseCode') == '000' else 'failed'
        order.payment_ref = data.get('pp_TxnRefNo', order.payment_ref)
        db.session.commit()
    return jsonify({"status": "received"})

@app.route('/api/easypaisa/callback', methods=['POST'])
def easypaisa_callback():
    data = request.form.to_dict() or request.json or {}
    order = Order.query.filter_by(order_ref=data.get('orderRefNum', '')).first()
    if order:
        order.payment_status = 'paid' if str(data.get('responseCode', '')).strip() == '0000' else 'failed'
        order.payment_ref = data.get('transactionId', order.payment_ref)
        db.session.commit()
    return jsonify({"status": "received"})

# ============================================================
#  ORDER STATUS
# ============================================================
@app.route('/api/order/<order_ref>')
def order_status(order_ref):
    order = Order.query.filter_by(order_ref=order_ref).first()
    if not order:
        return jsonify({"success": False, "message": "Order not found"}), 404
    return jsonify({"success": True, "order_ref": order.order_ref,
                    "payment_status": order.payment_status,
                    "payment_method": order.payment_method,
                    "total_amount": order.total_amount})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
