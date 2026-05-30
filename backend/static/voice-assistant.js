/* ===================================================
   PK MART – Professional AI Voice Assistant
   Full TTS on every reply · Mic auto-clears input
   Stops on close · Pro robot icon
   =================================================== */

(function () {
    'use strict';

    /* ══════════════════════════════════════════════
       STORE KNOWLEDGE BASE
    ══════════════════════════════════════════════ */
    const PRODUCTS = [
        { id:1,  name:"Dell XPS 13 Laptop",           price:185000, category:"Laptop"     },
        { id:2,  name:"HP Spectre x360 Laptop",       price:165000, category:"Laptop"     },
        { id:3,  name:"MacBook Air M2 Laptop",         price:245000, category:"Laptop"     },
        { id:4,  name:"Lenovo ThinkPad X1 Carbon",    price:210000, category:"Laptop"     },
        { id:5,  name:"ASUS ROG Zephyrus G14",        price:230000, category:"Laptop"     },
        { id:6,  name:"Microsoft Surface Pro 9",      price:195000, category:"Laptop"     },
        { id:7,  name:"Premium Smart Watch",           price:8500,   category:"Watch"      },
        { id:8,  name:"Luxury Leather Watch",          price:12500,  category:"Watch"      },
        { id:9,  name:"Samsung Galaxy Watch 6",        price:14500,  category:"Watch"      },
        { id:10, name:"Apple Watch Series 9",          price:75000,  category:"Watch"      },
        { id:11, name:"Garmin Fenix 7 Pro",            price:98000,  category:"Watch"      },
        { id:12, name:"Samsung Galaxy S24",            price:185000, category:"Mobile"     },
        { id:13, name:"iPhone 15 Pro Mobile",          price:295000, category:"Mobile"     },
        { id:14, name:"Xiaomi 14 Ultra Mobile",        price:135000, category:"Mobile"     },
        { id:15, name:"OnePlus 12 Mobile",             price:115000, category:"Mobile"     },
        { id:16, name:"Google Pixel 8 Pro",            price:175000, category:"Mobile"     },
        { id:17, name:"Vivo X100 Pro Mobile",          price:125000, category:"Mobile"     },
        { id:18, name:"Sony WH-1000XM5 Earbuds",      price:28500,  category:"Earbuds"    },
        { id:19, name:"Apple AirPods Pro 2",           price:32000,  category:"Earbuds"    },
        { id:20, name:"JBL Tune Beam Earbuds",         price:8500,   category:"Earbuds"    },
        { id:21, name:"Samsung Galaxy Buds2 Pro",      price:22000,  category:"Earbuds"    },
        { id:22, name:"Nothing Ear 2",                 price:18500,  category:"Earbuds"    },
        { id:23, name:"Anker 20000mAh Power Bank",     price:4500,   category:"Power Bank" },
        { id:24, name:"Xiaomi 30000mAh Power Bank",    price:6500,   category:"Power Bank" },
        { id:25, name:"Samsung 25W Fast Power Bank",   price:5200,   category:"Power Bank" },
        { id:26, name:"Baseus 65W GaN Power Bank",     price:7800,   category:"Power Bank" },
        { id:27, name:"iPad Pro 12.9 M2 Tablet",           price:195000, category:"Tablet"     },
        { id:28, name:"Samsung Galaxy Tab S9 Ultra Tablet", price:165000, category:"Tablet"     },
        { id:29, name:"Xiaomi Pad 6 Pro Tablet",            price:85000,  category:"Tablet"     },
        { id:33, name:"iPad Air M1 Tablet",                 price:155000, category:"Tablet"     },
        { id:34, name:"OnePlus Pad 2 Tablet",               price:72000,  category:"Tablet"     },
        { id:35, name:"Lenovo Tab P12 Pro Tablet",          price:98000,  category:"Tablet"     },
        { id:30, name:"Sony Alpha A7 IV Camera",       price:420000, category:"Camera"     },
        { id:31, name:"Canon EOS R6 Mark II Camera",   price:380000, category:"Camera"     },
        { id:32, name:"GoPro Hero 12 Black Camera",    price:78000,  category:"Camera"     },
    ];

    const PAYMENT_METHODS = [
        { name:"Cash on Delivery (COD)", desc:"Pay when your order arrives. No advance needed." },
        { name:"JazzCash",               desc:"Pakistan's leading mobile wallet." },
        { name:"EasyPaisa",              desc:"Pay via your EasyPaisa mobile account." },
        { name:"Stripe / Card",          desc:"Visa, MasterCard or any international card." },
    ];

    const STORE = {
        name: "PK Mart",
        tagline: "Pakistan's Premium Tech Store",
        phone: "0301-4254060",
        whatsapp: "0301-4254060",
        email: "supportpkmart@yahoo.com",
        location: "Lahore, Pakistan",
        delivery: "Free delivery in Lahore. Nationwide available.",
        return: "7-day return policy on all products.",
        warranty: "All products come with manufacturer warranty.",
        hours: "We are available 24/7 via WhatsApp and email.",
    };

    const CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];
    const fmt = n => "Rs " + n.toLocaleString('en-PK');

    /* ══════════════════════════════════════════════
       INTENT ENGINE
    ══════════════════════════════════════════════ */
    function detectIntent(text) {
        const t = text.toLowerCase().trim();

        // Greetings — very broad match, any position in sentence
        if (/\b(hi|hello|hey|salam|assalam|assalamualaikum|hii|helo|hellow|helloo|heyy|heyyy|good morning|good evening|good afternoon|goodmorning|goodevening|howdy|sup|whats up|what's up|yo|aoa|walaikum|asslam|asalam|slam)\b/.test(t))
            return { type:'greeting' };

        // Store info
        if (/contact|phone|number|call|reach|whatsapp|email|address|location|where are you|where is|hours|timing|open|close|available|find you/.test(t))
            return { type:'contact' };
        if (/deliver|shipping|dispatch|send|courier|ship/.test(t)) return { type:'delivery' };
        if (/return|refund|exchange|policy|warranty|guarantee|replace/.test(t)) return { type:'return' };
        if (/\b(about|who are you|what is pk mart|tell me about|pk mart|pkmart|store|shop)\b/.test(t)) return { type:'about' };

        // Payment
        if (/pay|payment|method|jazzcash|jazz cash|easypaisa|easy paisa|stripe|cod|cash on delivery|card|wallet|how to pay|checkout/.test(t))
            return { type:'payment' };

        // Count
        if ((/how many|total|count|number of/.test(t)) && /product|item|thing/.test(t))
            return { type:'count' };

        // Categories list
        if (/categor|type|kind|section|department|what do you sell|what you have|what products|show all/.test(t))
            return { type:'categories' };

        // Price range filters
        const underMatch = t.match(/under\s*(?:rs\.?\s*)?(\d[\d,]*)/);
        if (underMatch) return { type:'under', amount:parseInt(underMatch[1].replace(/,/g,'')), category:extractCategory(t) };
        if (/above|over|more than|greater than/.test(t)) {
            const amt = t.match(/(\d[\d,]+)/);
            if (amt) return { type:'above', amount:parseInt(amt[1].replace(/,/g,'')), category:extractCategory(t) };
        }

        // Cheapest / most expensive
        if (/cheap|affordable|budget|lowest|minimum|least expensive|cheapest|sasta|kam price|low price|best price/.test(t))
            return { type:'cheapest', category:extractCategory(t) };
        if (/expensive|highest|costli|premium|top|most expensive|priciest|best|flagship/.test(t))
            return { type:'expensive', category:extractCategory(t) };

        // Category listing
        const cat = extractCategory(t);
        if (cat && /show|list|all|see|what|available|have|do you|give me|display|products|items/.test(t))
            return { type:'list_category', category:cat };

        // Specific product price
        const product = findProduct(t);
        if (product && /price|cost|how much|kitna|rate|worth|value/.test(t)) return { type:'price', product };
        if (product) return { type:'product_info', product };

        // Category fallback (just say "laptop" or "mobile")
        if (cat) return { type:'list_category', category:cat };

        // Help
        if (/help|what can|assist|guide|support|commands|options/.test(t)) return { type:'help' };

        // Thank you
        if (/thank|thanks|shukriya|jazak|shuker/.test(t)) return { type:'thanks' };

        // Goodbye
        if (/bye|goodbye|khauda hafiz|later|see you|take care|alvida|phir milenge/.test(t)) return { type:'bye' };

        return { type:'unknown', query:text };
    }

    function extractCategory(t) {
        if (/laptop|macbook|notebook|thinkpad|spectre|rog|surface/.test(t)) return 'Laptop';
        if (/mobile|phone|smartphone|iphone|galaxy|pixel|oneplus|vivo|xiaomi/.test(t)) return 'Mobile';
        if (/watch|garmin|smartwatch/.test(t)) return 'Watch';
        if (/earbud|airpod|headphone|handfree|earphone|buds|sony wh|jbl|nothing ear/.test(t)) return 'Earbuds';
        if (/power bank|powerbank|charger|anker|baseus/.test(t)) return 'Power Bank';
        if (/tablet|ipad|galaxy tab|oneplus pad|lenovo tab|xiaomi pad|pad \d|tab \d/.test(t)) return 'Tablet';
        if (/camera|canon|sony alpha|gopro/.test(t)) return 'Camera';
        return null;
    }

    function findProduct(t) {
        let best = null, bestScore = 0;
        for (const p of PRODUCTS) {
            const words = p.name.toLowerCase().split(/\s+/);
            let score = 0;
            for (const w of words) if (w.length > 2 && t.includes(w)) score++;
            if (score > bestScore) { bestScore = score; best = p; }
        }
        return bestScore >= 2 ? best : null;
    }

    /* ══════════════════════════════════════════════
       RESPONSE BUILDER  (returns {html, speech})
    ══════════════════════════════════════════════ */
    function buildResponse(intent) {
        switch (intent.type) {

            case 'greeting':
                return say(
                    `👋 <b>Hello! Welcome to PK Mart!</b><br>I'm your AI shopping assistant. I can help with:<br>• Product prices &amp; availability<br>• Payment methods &amp; delivery<br>• Store contact &amp; policies<br>Just ask me anything!`,
                    `Hello! Welcome to PK Mart. I'm your AI shopping assistant. Ask me about products, prices, payment methods, or anything about the store!`
                );

            case 'about':
                return say(
                    `🏪 <b>About PK Mart</b><br>${STORE.tagline}<br><br>We are Pakistan's trusted tech store offering genuine laptops, mobiles, watches, earbuds, tablets, cameras and power banks — at the best prices with fast delivery.`,
                    `PK Mart is ${STORE.tagline}. We offer genuine tech products including laptops, mobiles, watches, earbuds, tablets, cameras, and power banks at the best prices in Pakistan.`
                );

            case 'contact':
                return say(
                    `📞 <b>Contact PK Mart</b><br>• 📱 Phone: <b>${STORE.phone}</b><br>• 💬 WhatsApp: <b>${STORE.whatsapp}</b><br>• 📧 Email: <b>${STORE.email}</b><br>• 📍 Location: ${STORE.location}<br>• 🕐 ${STORE.hours}`,
                    `You can reach us at ${STORE.phone} by phone or WhatsApp, or email us at ${STORE.email}. We are located in ${STORE.location} and available 24/7.`
                );

            case 'delivery':
                return say(
                    `🚚 <b>Delivery Info</b><br>${STORE.delivery}<br><br>Orders placed before 2 PM are dispatched the same day in Lahore.`,
                    `${STORE.delivery} Orders placed before 2 PM are dispatched the same day in Lahore.`
                );

            case 'return':
                return say(
                    `🔄 <b>Return &amp; Warranty Policy</b><br>• ${STORE.return}<br>• ${STORE.warranty}<br><br>Contact us on WhatsApp at ${STORE.whatsapp} to initiate a return.`,
                    `${STORE.return} ${STORE.warranty} Contact us on WhatsApp to initiate a return.`
                );

            case 'payment':
                return say(
                    `💳 <b>Payment Methods at PK Mart:</b><br>` + PAYMENT_METHODS.map(m=>`• <b>${m.name}</b> – ${m.desc}`).join('<br>'),
                    `PK Mart accepts ${PAYMENT_METHODS.map(m=>m.name).join(', ')}.`
                );

            case 'count':
                return say(
                    `🛒 PK Mart stocks <b>${PRODUCTS.length} products</b> across <b>${CATEGORIES.length} categories</b>.`,
                    `PK Mart stocks ${PRODUCTS.length} products across ${CATEGORIES.length} categories.`
                );

            case 'categories':
                return say(
                    `📦 <b>Our categories:</b><br>` + CATEGORIES.map(c=>`• <b>${c}s</b> (${PRODUCTS.filter(p=>p.category===c).length} products)`).join('<br>'),
                    `We carry ${CATEGORIES.join(', ')}.`
                );

            case 'list_category': {
                const items = PRODUCTS.filter(p=>p.category===intent.category);
                if (!items.length) return say(`😕 No products in "${intent.category}".`, `No products found in ${intent.category}.`);
                return say(
                    `📦 <b>${intent.category}s</b> at PK Mart:<br>` + items.map(p=>`• ${p.name} – <span class="va-price">${fmt(p.price)}</span>`).join('<br>'),
                    `Here are our ${intent.category}s: ` + items.map(p=>`${p.name} at ${fmt(p.price)}`).join(', ') + '.'
                );
            }

            case 'price':
                return say(
                    `💰 <b>${intent.product.name}</b><br>Price: <span class="va-price">${fmt(intent.product.price)}</span><br>Category: ${intent.product.category}`,
                    `The ${intent.product.name} is priced at ${fmt(intent.product.price)}.`
                );

            case 'product_info': {
                const p = intent.product;
                return say(
                    `📦 <b>${p.name}</b><br>Category: ${p.category}<br>Price: <span class="va-price">${fmt(p.price)}</span><br>${STORE.warranty}`,
                    `${p.name} is a ${p.category} priced at ${fmt(p.price)}. ${STORE.warranty}`
                );
            }

            case 'cheapest': {
                const pool = intent.category ? PRODUCTS.filter(p=>p.category===intent.category) : PRODUCTS;
                const p = pool.reduce((a,b)=>a.price<b.price?a:b);
                return say(
                    `✅ <b>Most affordable${intent.category?' '+intent.category:''}:</b><br>${p.name}<br><span class="va-price">${fmt(p.price)}</span>`,
                    `The most affordable${intent.category?' '+intent.category:''} is the ${p.name} at ${fmt(p.price)}.`
                );
            }

            case 'expensive': {
                const pool = intent.category ? PRODUCTS.filter(p=>p.category===intent.category) : PRODUCTS;
                const p = pool.reduce((a,b)=>a.price>b.price?a:b);
                return say(
                    `💎 <b>Most premium${intent.category?' '+intent.category:''}:</b><br>${p.name}<br><span class="va-price">${fmt(p.price)}</span>`,
                    `The most premium${intent.category?' '+intent.category:''} is the ${p.name} at ${fmt(p.price)}.`
                );
            }

            case 'under': {
                const pool = (intent.category?PRODUCTS.filter(p=>p.category===intent.category):PRODUCTS).filter(p=>p.price<=intent.amount);
                if (!pool.length) return say(`😕 No products found under ${fmt(intent.amount)}.`, `No products found under ${fmt(intent.amount)}.`);
                return say(
                    `🔍 <b>${pool.length} product(s) under ${fmt(intent.amount)}:</b><br>`+pool.map(p=>`• ${p.name} – <span class="va-price">${fmt(p.price)}</span>`).join('<br>'),
                    `${pool.length} products under ${fmt(intent.amount)}: ` + pool.slice(0,4).map(p=>p.name).join(', ') + (pool.length>4?` and ${pool.length-4} more.`:'.')
                );
            }

            case 'above': {
                const pool = (intent.category?PRODUCTS.filter(p=>p.category===intent.category):PRODUCTS).filter(p=>p.price>=intent.amount);
                if (!pool.length) return say(`😕 No products above ${fmt(intent.amount)}.`, `No products found above ${fmt(intent.amount)}.`);
                return say(
                    `🔍 <b>${pool.length} product(s) above ${fmt(intent.amount)}:</b><br>`+pool.map(p=>`• ${p.name} – <span class="va-price">${fmt(p.price)}</span>`).join('<br>'),
                    `${pool.length} products above ${fmt(intent.amount)}: ` + pool.slice(0,4).map(p=>p.name).join(', ') + (pool.length>4?` and ${pool.length-4} more.`:'.')
                );
            }

            case 'thanks':
                return say(`😊 You're welcome! Is there anything else I can help you with?`, `You're welcome! Is there anything else I can help you with?`);

            case 'bye':
                return say(`👋 Goodbye! Thank you for visiting PK Mart. Come back soon!`, `Goodbye! Thank you for visiting PK Mart. Come back soon!`);

            case 'help':
                return say(
                    `🤖 <b>I can answer questions about:</b><br>• Products &amp; prices (e.g. "iPhone 15 Pro price")<br>• Categories (e.g. "show all laptops")<br>• Cheapest/best (e.g. "cheapest mobile")<br>• Budget (e.g. "under Rs 10,000")<br>• Payment methods<br>• Delivery &amp; returns<br>• Contact info<br>• About PK Mart`,
                    `I can help with products and prices, categories, payment methods, delivery and return policies, and store contact information. Just ask me anything!`
                );

            default:
                return say(
                    `🤔 I didn't quite catch that. Try asking:<br>• "Show me all mobiles"<br>• "Price of MacBook Air M2"<br>• "Cheapest watch"<br>• "Payment methods"<br>• "Delivery info"<br>• "Contact number"`,
                    `I didn't understand that. You can ask me about products, prices, payment methods, delivery, or contact information.`
                );
        }
    }

    function say(html, speech) { return { html, speech }; }

    /* ══════════════════════════════════════════════
       TTS — speaks EVERY reply, stops on close
       speechEnabled = false until user first opens panel
    ══════════════════════════════════════════════ */
    let speechEnabled = false;

    function speak(text) {
        if (!speechEnabled) return;           // never speak before user opens panel
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        if (!text || !text.trim()) return;
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang  = 'en-US';
        utt.rate  = 1.0;
        utt.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const pref = voices.find(v => /Google US English|Samantha|Zira|David/.test(v.name));
        if (pref) utt.voice = pref;
        window.speechSynthesis.speak(utt);
    }

    function stopSpeech() {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    /* ══════════════════════════════════════════════
       DOM HELPERS
    ══════════════════════════════════════════════ */
    function addMsg(html, role) {
        const chat = document.getElementById('va-chat');
        const div  = document.createElement('div');
        div.className = `va-msg ${role}`;
        div.innerHTML  = html;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
    function showTyping() {
        const chat = document.getElementById('va-chat');
        const div  = document.createElement('div');
        div.className = 'va-msg bot typing';
        div.id = 'va-typing';
        div.innerHTML = '<span></span><span></span><span></span>';
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }
    function removeTyping() { const el = document.getElementById('va-typing'); if (el) el.remove(); }

    function setStatus(state) {
        const dot  = document.getElementById('va-status-dot');
        const lbl  = document.getElementById('va-status-label');
        if (dot) dot.className = state;
        if (lbl) lbl.textContent = state === 'listening' ? 'Listening…' : state === 'thinking' ? 'Thinking…' : 'Online';
    }

    /* ══════════════════════════════════════════════
       PROCESS INPUT
       voiceInput=true  → speak the reply
       voiceInput=false → text only, no speech
    ══════════════════════════════════════════════ */
    function processInput(text, voiceInput) {
        if (!text || !text.trim()) return;
        const inp = document.getElementById('va-text-input');
        if (inp) inp.value = '';

        addMsg(text, 'user');
        showTyping();
        setStatus('thinking');

        setTimeout(() => {
            removeTyping();
            const intent   = detectIntent(text);
            const response = buildResponse(intent);
            addMsg(response.html, 'bot');
            if (voiceInput) speak(response.speech);   // only speak if asked by voice
            setStatus('');
        }, 400);
    }

    /* ══════════════════════════════════════════════
       SPEECH RECOGNITION
       Works on Chrome, Edge, Safari, Firefox
    ══════════════════════════════════════════════ */
    let recognizing  = false;
    let recognition  = null;

    function setupSpeech() {
        // Edge 79+: window.SpeechRecognition  |  Chrome: webkitSpeechRecognition
        const SR = window.SpeechRecognition
                || window.webkitSpeechRecognition
                || window.msSpeechRecognition;

        if (!SR) {
            const btn = document.getElementById('va-mic-btn');
            if (btn) { btn.style.opacity='0.35'; btn.style.pointerEvents='none'; btn.title='Voice not supported — please type'; }
            return;
        }

        function makeRec() {
            const r = new SR();
            // Use browser language so Edge picks up the locale correctly
            r.lang = navigator.language || 'en-US';
            r.interimResults = false;
            r.maxAlternatives = 5;
            r.continuous = false;

            r.onstart = () => {
                recognizing = true;
                const btn = document.getElementById('va-mic-btn');
                if (btn) btn.classList.add('active');
                const trig = document.getElementById('va-trigger');
                if (trig) trig.classList.add('va-listening');
                setStatus('listening');
                const inp = document.getElementById('va-text-input');
                if (inp) { inp.value = ''; inp.placeholder = '🎙️ Listening — speak now…'; }
            };

            r.onresult = (e) => {
                let best = '';
                // Walk all result+alternative slots for the best non-empty string
                outer: for (let ri = 0; ri < e.results.length; ri++) {
                    for (let ai = 0; ai < e.results[ri].length; ai++) {
                        const t = (e.results[ri][ai].transcript || '').trim();
                        if (t) { best = t; break outer; }
                    }
                }
                if (best) {
                    const inp = document.getElementById('va-text-input');
                    if (inp) inp.value = best;
                    processInput(best, true);   // voice → also speak the reply
                }
            };

            r.onspeechend = () => { try { r.stop(); } catch(_){} };

            r.onerror = (ev) => {
                stopListening();
                const err = ev.error || '';
                if (err === 'aborted' || err === 'no-speech') return; // silent
                let msg = '🎙️ Could not hear you. Please try again or type your question.';
                if (err === 'not-allowed' || err === 'permission-denied')
                    msg = '🎙️ Microphone blocked. Click the 🔒 lock icon in the address bar → allow microphone, then try again.';
                else if (err === 'network')
                    msg = '🌐 Voice needs internet. Please type your question instead.';
                else if (err === 'audio-capture')
                    msg = '🎙️ No microphone found. Connect a mic and try again.';
                addMsg(msg, 'bot');
            };

            // Recreate after every session — required by Edge & some Chrome versions
            r.onend = () => { stopListening(); recognition = makeRec(); };
            return r;
        }

        recognition = makeRec();
    }

    function stopListening() {
        recognizing = false;
        const btn = document.getElementById('va-mic-btn');
        if (btn) btn.classList.remove('active');
        const trig = document.getElementById('va-trigger');
        if (trig) trig.classList.remove('va-listening');
        setStatus('');
        const inp = document.getElementById('va-text-input');
        if (inp) inp.placeholder = 'Type or tap 🎙️ to speak…';
    }

    function toggleMic() {
        if (!recognition) {
            addMsg('🎙️ Voice input is not supported in this browser. Please type your question.', 'bot');
            return;
        }
        // Tap during speech → stop speaking immediately
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            stopSpeech();
            return;
        }
        if (recognizing) {
            try { recognition.stop(); } catch(_) {}
            stopListening();
        } else {
            // Edge needs a small delay before start() after previous session ends
            setTimeout(() => {
                try {
                    recognition.start();
                } catch(e) {
                    stopListening();
                    // Recreate and retry once
                    setupSpeech();
                    setTimeout(() => {
                        try { recognition.start(); } catch(e2) {
                            addMsg('🎙️ Could not start the microphone. In Edge: go to Settings → Site permissions → Microphone and allow this site.', 'bot');
                        }
                    }, 150);
                }
            }, 80);
        }
    }

    /* ══════════════════════════════════════════════
       CHIPS
    ══════════════════════════════════════════════ */
    const CHIPS = ['Show laptops', 'Show mobiles', 'Cheapest product', 'Payment methods', 'Delivery info', 'Contact us'];
    function renderChips() {
        const bar = document.getElementById('va-chips');
        if (!bar) return;
        bar.innerHTML = '';
        CHIPS.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'va-chip';
            btn.textContent = c;
            btn.onclick = () => processInput(c, false);  // chip tap → no speech
            bar.appendChild(btn);
        });
    }

    /* ══════════════════════════════════════════════
       PROFESSIONAL ROBOT ICON SVG
    ══════════════════════════════════════════════ */
    function roboSVG(w, h) {
        return `<svg width="${w}" height="${h}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <!-- Headband arc -->
  <path d="M18 35 C18 18 62 18 62 35" stroke="rgba(255,255,255,0.92)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- Left ear cup outer -->
  <ellipse cx="14" cy="41" rx="7" ry="10" fill="rgba(255,255,255,0.95)"/>
  <!-- Left ear cup inner -->
  <ellipse cx="14" cy="41" rx="4" ry="6.5" fill="#003580"/>
  <!-- Right ear cup outer -->
  <ellipse cx="66" cy="41" rx="7" ry="10" fill="rgba(255,255,255,0.95)"/>
  <!-- Right ear cup inner -->
  <ellipse cx="66" cy="41" rx="4" ry="6.5" fill="#003580"/>
  <!-- Head/visor body -->
  <rect x="22" y="28" width="36" height="28" rx="9" fill="rgba(255,255,255,0.93)"/>
  <!-- Left eye — glowing blue rect -->
  <rect x="26" y="34" width="11" height="8" rx="3" fill="#001f3f"/>
  <rect x="27.5" y="35.5" width="4" height="3" rx="1.5" fill="#60a5fa" opacity="0.95"/>
  <!-- Right eye — glowing blue rect -->
  <rect x="43" y="34" width="11" height="8" rx="3" fill="#001f3f"/>
  <rect x="44.5" y="35.5" width="4" height="3" rx="1.5" fill="#60a5fa" opacity="0.95"/>
  <!-- Smile bar -->
  <rect x="28" y="47" width="24" height="5" rx="2.5" fill="#e2e8f4"/>
  <!-- Smile dots -->
  <circle cx="33" cy="49.5" r="1.8" fill="#003580"/>
  <circle cx="40" cy="49.5" r="1.8" fill="#003580"/>
  <circle cx="47" cy="49.5" r="1.8" fill="#003580"/>
  <!-- Chin connector -->
  <rect x="35" y="56" width="10" height="5" rx="2.5" fill="rgba(255,255,255,0.6)"/>
</svg>`;
    }

    /* ══════════════════════════════════════════════
       BUILD UI
    ══════════════════════════════════════════════ */
    function buildUI() {
        if (!document.getElementById('va-css')) {
            const link = document.createElement('link');
            link.id = 'va-css'; link.rel = 'stylesheet';
            link.href = '/static/voice-assistant.css';
            document.head.appendChild(link);
        }

        // Floating trigger button
        const trigger = document.createElement('button');
        trigger.id    = 'va-trigger';
        trigger.title = 'Chat with PK Mart Assistant';
        trigger.innerHTML = roboSVG(36, 36);
        trigger.onclick = () => togglePanel();
        document.body.appendChild(trigger);

        // Chat panel
        const panel = document.createElement('div');
        panel.id = 'va-panel';
        panel.innerHTML = `
        <div id="va-header">
            <div id="va-avatar">${roboSVG(28, 28)}</div>
            <div id="va-title">
                <strong>PK Mart Assistant</strong>
                <div style="display:flex;align-items:center;gap:5px;margin-top:3px;">
                    <div id="va-status-dot"></div>
                    <span id="va-status-label">Online</span>
                </div>
            </div>
            <button id="va-close-btn" onclick="window.vaTogglePanel()" title="Close">&#215;</button>
        </div>
        <div id="va-chat"></div>
        <div id="va-chips"></div>
        <div id="va-input-bar">
            <input id="va-text-input" type="text" placeholder="Type or tap 🎙️ to speak…" autocomplete="off"/>
            <button id="va-mic-btn" title="Tap to speak" onclick="window.vaMicToggle()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V20H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 11h-2z"/>
                </svg>
            </button>
            <button id="va-send-btn" title="Send" onclick="window.vaSend()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
            </button>
        </div>`;
        document.body.appendChild(panel);

        // Enter key sends
        panel.querySelector('#va-text-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') window.vaSend();
        });

        renderChips();
        setupSpeech();

        // Preload voices (Chrome needs this) — silently, no speaking
        // Silently preload voices list — no audio, no autoplay
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            // Cancel anything that might have queued
            window.speechSynthesis.cancel();
        }

        // Show welcome text only (zero audio on page load)
        const welcome = `👋 <b>Hi! I'm your PK Mart AI Assistant.</b><br><br>I can help you with:<br>• 📦 Product prices &amp; availability<br>• 💳 Payment methods (JazzCash, EasyPaisa, Card, COD)<br>• 🚚 Delivery &amp; shipping info<br>• 🔄 Return &amp; warranty policy<br>• 📞 Contact &amp; store info<br><br>Just type or tap the mic and ask me anything!`;
        addMsg(welcome, 'bot');
        // Speech NEVER fires here — only after user clicks the panel button
    }

    /* ══════════════════════════════════════════════
       PANEL TOGGLE — stops speech + mic on close,
       speaks greeting only on first open
    ══════════════════════════════════════════════ */
    let panelOpen = false;
    let greetedOnce = false;

    function togglePanel() {
        const panel = document.getElementById('va-panel');
        panelOpen = !panelOpen;
        if (panelOpen) {
            panel.classList.add('va-open');
            if (!greetedOnce) {
                greetedOnce  = true;
                speechEnabled = true;   // unlock speech for future voice questions
            }
        } else {
            panel.classList.remove('va-open');
            stopSpeech();
            if (recognizing && recognition) { try { recognition.stop(); } catch(e){} }
        }
    }

    /* ══════════════════════════════════════════════
       GLOBAL API
    ══════════════════════════════════════════════ */
    window.vaTogglePanel = togglePanel;
    window.vaMicToggle   = toggleMic;
    window.vaSend        = () => {
        const inp = document.getElementById('va-text-input');
        const val = inp ? inp.value.trim() : '';
        if (val) processInput(val, false);  // typed → no speech
    };

    /* ── INIT ── */
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', buildUI);
    else buildUI();

})();
