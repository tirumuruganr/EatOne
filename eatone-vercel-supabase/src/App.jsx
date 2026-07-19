import React, { useState, useMemo, useRef } from "react";
import { createOrder } from "./orderApi.js";
import {
  Leaf, Flame, Heart, Sparkles, Check, Plus, Minus, X,
  MessageCircle, ChevronDown, ChevronUp, ShoppingBag, Nut, Phone, MapPin, ShieldCheck, Play, ArrowRight, Star, Menu
} from "lucide-react";

/* ------------------------------------------------------------------
   EDIT THESE BEFORE GOING LIVE
------------------------------------------------------------------- */
const WHATSAPP_NUMBER = "919150408320"; // real WhatsApp business number, +91 country code included
const WHATSAPP_DISPLAY = "+91 91504 08320";
const BRAND_INSTAGRAM = "https://www.instagram.com/eat.one1/";
const BRAND_LOGO = "https://eatone.vercel.app/assets/eatone-logo-DhlRZS1v.png";
const LADOO_IMAGE = "https://eatone.vercel.app/assets/ladoo-real-BUc1IaPf.png";
const BOWL_IMAGE = "https://eatone.vercel.app/assets/ladoo-bowl-D35IW5oU.jpg";
const FSSAI_NUMBER = "21226008002884";

/* ------------------------------------------------------------------
   PRODUCT DATA (from your backend)
------------------------------------------------------------------- */
/* ------------------------------------------------------------------
   DELIVERY CHARGES
------------------------------------------------------------------- */
const deliveryCharges = {
  bangalore: { "1kg": 80, "1.5kg": 120, "2kg": 160 },
  karnataka: { "1kg": 120, "1.5kg": 160, "2kg": 200 },
  southIndia: { "1kg": 140, "1.5kg": 180, "2kg": 220 },
  northIndiaMetro: { "1kg": 260, "1.5kg": 350, "2kg": null },
  northIndiaGeneral: { "1kg": 330, "1.5kg": 430, "2kg": null },
};

const REGIONS = [
  { key: "bangalore", label: "Bangalore" },
  { key: "karnataka", label: "Karnataka (outside Bangalore)" },
  { key: "southIndia", label: "South India" },
  { key: "northIndiaMetro", label: "North India Metro (Mumbai/Delhi/Kolkata/Pune/Ahmedabad)" },
  { key: "northIndiaGeneral", label: "North India (other)" },
];

// North India Metro PIN code prefixes
const metroPincodePrefixes = {
  mumbai: ["400"],
  delhi: ["110"],
  kolkata: ["700"],
  pune: ["411"],
  ahmedabad: ["380"],
};

// Get billable shipping weight band. Regions with a dedicated "500gm" rate get a finer band;
// regions without one keep 500g-950g grouped into the "1kg" band.
function getShippingWeight(ladooWeightInGrams) {
  const grams = Number(ladooWeightInGrams);
  if (!Number.isFinite(grams) || grams <= 0) {
    throw new Error("Invalid order weight");
  }

  // Shipping slab rules:
  // 500g–950g => 1kg
  // 951g–1450g => 1.5kg
  // 1451g–2000g => 2kg
  if (grams <= 950) return "1kg";
  if (grams <= 1450) return "1.5kg";
  if (grams <= 2000) return "2kg";

  throw new Error("Order weight exceeds configured shipping slabs");
}

// Check if PIN code belongs to a North India Metro city
function isMetroPincode(pincode) {
  const pin = String(pincode || "").trim();
  return pin.startsWith("400") || // Mumbai
         pin.startsWith("110") || // Delhi
         pin.startsWith("700") || // Kolkata
         pin.startsWith("411") || // Pune
         pin.startsWith("380");   // Ahmedabad
}

// Calculate delivery charge
function calculateDeliveryCharge({ ladooWeightInGrams, pincode, region }) {
  let deliveryRegion = region;
  // Override North India General if PIN belongs to Metro
  if (region === "northIndiaGeneral" && isMetroPincode(pincode)) {
    deliveryRegion = "northIndiaMetro";
  }
  const hasFiveHundredGramTier = deliveryCharges[deliveryRegion]?.["500gm"] !== undefined;
  const shippingWeight = getShippingWeight(ladooWeightInGrams, hasFiveHundredGramTier);
  const deliveryCharge = deliveryCharges[deliveryRegion]?.[shippingWeight];
  if (deliveryCharge === undefined) {
    throw new Error("Invalid delivery region");
  }
  if (deliveryCharge === null) {
    throw new Error(`Delivery charge not configured for ${deliveryRegion} - ${shippingWeight}`);
  }
  return { ladooWeight: ladooWeightInGrams, shippingWeight, deliveryRegion, deliveryCharge };
}

// Parse a tier label like "500 gm" / "1.5 kg" into grams
function parseTierGrams(label) {
  const match = label.trim().match(/^([\d.]+)\s*(gm|kg)$/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return match[2].toLowerCase() === "kg" ? value * 1000 : value;
}

// Infer delivery region automatically from a PIN code (standard Indian postal prefixes)
function inferRegionFromPincode(pincode) {
  const pin = String(pincode || "").replace(/\D/g, "").slice(0, 6);
  if (pin.length !== 6) return null;

  const first3 = Number(pin.slice(0, 3));
  const first2 = Number(pin.slice(0, 2));

  if (pin.startsWith("560")) return "bangalore";
  if (first3 >= 560 && first3 <= 591) return "karnataka";

  // Tamil Nadu: 600000–669999 (635601 included)
  if (first2 >= 60 && first2 <= 66) return "southIndia";
  // Andhra Pradesh / Telangana
  if (first2 >= 50 && first2 <= 53) return "southIndia";
  // Kerala
  if (first2 >= 67 && first2 <= 69) return "southIndia";

  if (isMetroPincode(pin)) return "northIndiaMetro";
  return "northIndiaGeneral";
}

const products = [
  {
    id: 1,
    name: "Multi-Nutrition Ladoo",
    blurb: "Our everyday recipe — almonds, cashews, pistachios, dates and seeds, hand-rolled fresh.", // placeholder copy, edit freely
    accent: "terracotta",
    prices: [
      { quantity: "500 gm", price: 699, minLadoos: 33, maxLadoos: 35 },
      { quantity: "750 gm", price: 1049, minLadoos: 51, maxLadoos: 54 },
      { quantity: "1 kg", price: 1349, minLadoos: 66, maxLadoos: 70 },
      { quantity: "1.5 kg", price: 1999, minLadoos: 99, maxLadoos: 105 },
      { quantity: "2 kg", price: 2649, minLadoos: 132, maxLadoos: 140 },
      { quantity: "2.5 kg", price: 3349, minLadoos: 165, maxLadoos: 175 },
      { quantity: "3 kg", price: 3999, minLadoos: 198, maxLadoos: 210 },
      { quantity: "3.5 kg", price: 4649, minLadoos: 231, maxLadoos: 245 },
      { quantity: "4 kg", price: 5349, minLadoos: 264, maxLadoos: 280 },
      { quantity: "4.5 kg", price: 5999, minLadoos: 297, maxLadoos: 315 },
      { quantity: "5 kg", price: 6699, minLadoos: 330, maxLadoos: 350 },
    ],
  },
  {
    id: 2,
    name: "Multi-Nutrition Ladoo (Extra Dry Fruit)",
    blurb: "The same daily blend, loaded with an extra handful of premium dry fruit.", // placeholder copy, edit freely
    accent: "sage",
    prices: [
      { quantity: "500 gm", price: 799, minLadoos: 33, maxLadoos: 35 },
      { quantity: "750 gm", price: 1199, minLadoos: 51, maxLadoos: 54 },
      { quantity: "1 kg", price: 1549, minLadoos: 66, maxLadoos: 70 },
      { quantity: "1.5 kg", price: 2299, minLadoos: 99, maxLadoos: 105 },
      { quantity: "2 kg", price: 3049, minLadoos: 132, maxLadoos: 140 },
      { quantity: "2.5 kg", price: 3849, minLadoos: 165, maxLadoos: 175 },
      { quantity: "3 kg", price: 4599, minLadoos: 198, maxLadoos: 210 },
      { quantity: "3.5 kg", price: 5399, minLadoos: 231, maxLadoos: 245 },
      { quantity: "4 kg", price: 6149, minLadoos: 264, maxLadoos: 280 },
      { quantity: "4.5 kg", price: 6949, minLadoos: 297, maxLadoos: 315 },
      { quantity: "5 kg", price: 7699, minLadoos: 330, maxLadoos: 350 },
    ],
  },
  {
    id: 3,
    name: "Post-Partum Gond-Poppy Ladoo",
    blurb: "A traditional recovery recipe with edible gum (gond), poppy seeds, ghee and warming spices, for new mothers.", // placeholder copy, edit freely
    accent: "rust",
    prices: [
      { quantity: "500 gm", price: 899, minLadoos: 33, maxLadoos: 35 },
      { quantity: "750 gm", price: 1299, minLadoos: 51, maxLadoos: 54 },
      { quantity: "1 kg", price: 1699, minLadoos: 66, maxLadoos: 70 },
      { quantity: "1.5 kg", price: 2499, minLadoos: 99, maxLadoos: 105 },
      { quantity: "2 kg", price: 3349, minLadoos: 132, maxLadoos: 140 },
      { quantity: "2.5 kg", price: 4199, minLadoos: 165, maxLadoos: 175 },
      { quantity: "3 kg", price: 5049, minLadoos: 198, maxLadoos: 210 },
      { quantity: "3.5 kg", price: 5899, minLadoos: 231, maxLadoos: 245 },
      { quantity: "4 kg", price: 6749, minLadoos: 264, maxLadoos: 280 },
      { quantity: "4.5 kg", price: 7599, minLadoos: 297, maxLadoos: 315 },
      { quantity: "5 kg", price: 8449, minLadoos: 330, maxLadoos: 350 },
    ],
  },
  {
    id: 4,
    name: "Choco Hazelnut Ladoo",
    blurb: "Our indulgent one — roasted hazelnuts and cocoa, for when you want dessert that still does you good.", // placeholder copy, edit freely
    accent: "terracotta",
    prices: [
      { quantity: "500 gm", price: 949 },
      { quantity: "750 gm", price: 1429 },
      { quantity: "1 kg", price: 1799 },
      { quantity: "1.5 kg", price: 2699, minLadoos: 99, maxLadoos: 105 },
      { quantity: "2 kg", price: 3599, minLadoos: 132, maxLadoos: 140 },
      { quantity: "2.5 kg", price: 4499, minLadoos: 165, maxLadoos: 175 },
      { quantity: "3 kg", price: 5399, minLadoos: 198, maxLadoos: 210 },
      { quantity: "3.5 kg", price: 6299, minLadoos: 231, maxLadoos: 245 },
      { quantity: "4 kg", price: 7199, minLadoos: 264, maxLadoos: 280 },
      { quantity: "4.5 kg", price: 8099, minLadoos: 297, maxLadoos: 315 },
      { quantity: "5 kg", price: 8999, minLadoos: 330, maxLadoos: 350 },
    ],
  },
];

const DEFAULT_VISIBLE_TIERS = 3; // show 500g/750g/1kg by default, rest behind "show more sizes"

const ORBIT_INGREDIENTS = ["Almonds", "Flax Seeds", "Sunflower Seeds", "Cashews", "Hazelnuts", "Pumpkin Seeds", "Walnuts"];

const benefits = [
  { icon: Flame, title: "Energy", text: "Slow-release fuel from nuts and jaggery — no sugar crash by 4pm." },
  { icon: Leaf, title: "Nutrition", text: "A working set of seeds, nuts and dates in every single ladoo." },
  { icon: Heart, title: "Made For You", text: "Everyday, celebratory or post-partum — a recipe for the moment." },
  { icon: Nut, title: "Premium Ingredients", text: "Almonds, cashews, hazelnuts and walnuts, always top grade." },
  { icon: Sparkles, title: "Hand-Rolled", text: "Small batches, rolled by hand, never machine-pressed." },
  { icon: Check, title: "Nothing Hidden", text: "No preservatives, no refined sugar, no artificial anything." },
];

const testimonials = [
  { quote: "\u201cFresh, delicious, and perfectly balanced in sweetness — every bite packed with crunchy nuts and nutritious seeds. Premium, gift-worthy packaging with an attractive design.\u201d" },
  { quote: "\u201cSuper delicious. And the plus point is it's healthy, so I can eat it without any guilt!\u201d" },
  { quote: "\u201cDelivery took a few days, but the whole box was finished in minutes. Very tasty — I'll reorder soon when I'm back in Bangalore.\u201d" },
  { quote: "\u201cReceived the order with proper packaging. The taste is really good, made with natural ingredients and no additives.\u201d" },
  { quote: "\u201cToo delicious and too yummy — packing is good, delivery is fast, and the price is reasonable. Definitely buying again!\u201d" },
];

const faqs = [
  { q: "What’s inside a Multi-Nutrition Ladoo?", a: "All the healthy nuts, seeds and dates which are essential for the body." },
  { q: "Does it contain added sugar?", a: "No." },
  { q: "Does it contain any preservatives or artificial ingredients?", a: "No." },
  { q: "Does it contain nuts or other allergens?", a: "It contains nuts including cashews, almonds, pistachios and walnuts." },
  { q: "How many ladoos should I eat in a day?", a: "1–3 ladoos a day." },
  { q: "Is it suitable for kids?", a: "Yes." },
  { q: "Is it suitable for pregnant or breastfeeding women?", a: "Yes." },
  { q: "How long do the ladoos stay fresh?", a: "60 days." },
  { q: "How should I store the ladoos?", a: "Store them in a cool, dry place in an airtight container." },
  { q: "Do they need to be refrigerated?", a: "Not necessary." },
  { q: "What sizes or quantities are available?", a: "Available in 500 gm, 750 gm, 1 kg, 1.5 kg, 2 kg, 2.5 kg, 3 kg, 3.5 kg, 4 kg, 4.5 kg and 5 kg sizes." },
  { q: "Do you deliver everywhere in India?", a: "Yes." },
  { q: "How long does delivery take?", a: "Delivery typically takes 1–4 days." },
  { q: "How can I track my order?", a: "A tracking link will be provided once your order is dispatched." },
  { q: "What should I do if my order arrives damaged?", a: "Please contact us through our Instagram handle @eat.one1." },
  { q: "Can I cancel or modify my order?", a: "No." },
  { q: "What payment methods do you accept?", a: "Online payments only. Cash on Delivery (COD) is not available." },
];

/* Warm cream + terracotta theme, matched to the reference site */
const CREAM = "#FFFFFF";
const BAND = "#EAF3E8";
const CARD = "#FFFFFF";
const CREAM_ALT = "#FFFFFF"; // kept for compatibility, same as CARD
const DARK = "#2A2016";
const MUTED = "#2A201677";
const SAGE_GREEN = "#3F6D3E";
const BADGE_GREEN_BG = "#DEEEDC";
const BURNT_ORANGE = "#CB6A35";
const STAR_GOLD = "#E3A73A";

const ACCENTS = {
  terracotta: { bg: BURNT_ORANGE, ring: BURNT_ORANGE },
  sage: { bg: SAGE_GREEN, ring: SAGE_GREEN },
  rust: { bg: "#B65C3F", ring: "#B65C3F" },
};

function Ladoo({ size = 44, seed = 0 }) {
  return (
    <img
      src={LADOO_IMAGE}
      alt="EAT ONE ladoo"
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function HeroArt() {
  const sizes = [30, 44, 60, 44, 30];
  return (
    <div className="flex items-end justify-center gap-3 md:gap-4">
      {sizes.map((s, i) => (
        <div key={i} className="rounded-full shadow-lg" style={{ transform: i === 2 ? "translateY(-8px)" : "none" }}>
          <Ladoo size={s + 30} seed={i + 1} />
        </div>
      ))}
    </div>
  );
}


const approximateLadooCount = (quantity) => {
  const counts = {
    "500 gm": "~33–35 pcs", "500gm": "~33–35 pcs",
    "750 gm": "~51–54 pcs", "750gm": "~51–54 pcs",
    "1 kg": "~66–70 pcs", "1.5 kg": "~99–105 pcs",
    "2 kg": "~132–140 pcs", "2.5 kg": "~165–175 pcs",
    "3 kg": "~198–210 pcs", "3.5 kg": "~231–245 pcs",
    "4 kg": "~264–280 pcs", "4.5 kg": "~297–315 pcs",
    "5 kg": "~330–350 pcs"
  };
  return counts[quantity] || "";
};

export default function EatOneSite() {

  const [activeProductId, setActiveProductId] = useState(products[0].id);
  const [selectedTier, setSelectedTier] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});
  const [cart, setCart] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2200);
  };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };
  const [address, setAddress] = useState({ name: "", phone: "", line: "", pincode: "" });

  // Checkout validation
  const validName = /^[A-Za-z][A-Za-z .'-]*$/.test(address.name.trim());
  const validPhone = /^[6-9]\d{9}$/.test(address.phone.trim());
  const validPincode = /^[1-9]\d{5}$/.test(address.pincode.trim());

  const activeProduct = products.find((p) => p.id === activeProductId);
  const accent = ACCENTS[activeProduct.accent];
  const isExpanded = !!expandedSizes[activeProduct.id];
  const visibleTiers = isExpanded ? activeProduct.prices : activeProduct.prices.slice(0, DEFAULT_VISIBLE_TIERS);

  const addToCart = (product, tier) => {
    const key = `${product.id}-${tier.quantity}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) return prev.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { key, productId: product.id, productName: product.name, tierLabel: tier.quantity, price: tier.price, qty: 1 }];
    });
    showToast(`${product.name} (${tier.quantity}) added to your box`);
  };

  const updateQty = (key, delta) => {
    setCart((prev) => prev.map((c) => (c.key === key ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0));
  };
  const removeItem = (key) => setCart((prev) => prev.filter((c) => c.key !== key));

  const itemsTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const totalWeightGrams = cart.reduce((sum, c) => sum + parseTierGrams(c.tierLabel) * c.qty, 0);
  const inferredRegion = useMemo(() => validPincode ? inferRegionFromPincode(address.pincode) : null, [address.pincode, validPincode]);

  const shipping = useMemo(() => {
    if (!validPincode || totalWeightGrams <= 0) return null;
    try {
      const region = inferRegionFromPincode(address.pincode);
      if (!region) return null;
      return calculateDeliveryCharge({
        ladooWeightInGrams: totalWeightGrams,
        pincode: address.pincode,
        region,
      });
    } catch (error) {
      console.warn("Shipping calculation unavailable:", error.message);
      return { error: true };
    }
  }, [validPincode, totalWeightGrams, address.pincode]);

  const shippingCharge =
    shipping && !shipping.error && Number.isFinite(Number(shipping.deliveryCharge))
      ? Number(shipping.deliveryCharge)
      : 0;
  const total = itemsTotal + shippingCharge;
  const addressComplete = validName && validPhone && address.line.trim().length >= 5 && validPincode && shipping && !shipping.error;

  const waLink = useMemo(() => {
    if (cart.length === 0) return "#";
    const lines = cart.map((c) => `• ${c.productName} — ${c.tierLabel} x${c.qty} — Rs.${c.price * c.qty}`);
    const shippingLine = shipping && !shipping.error
      ? `Shipping (${shipping.shippingWeight}): Rs.${shipping.deliveryCharge}`
      : "Shipping: to be confirmed";
    const msg = [
      "Hi EAT ONE! I'd like to order:",
        "",
      "",
      ...lines,
      "",
      `Items total: Rs.${itemsTotal}`,
      shippingLine,
      `Grand total: Rs.${total}`,
      "",
      "Delivery details:",
      `Name: ${address.name || "-"}`,
      `Phone: ${address.phone || "-"}`,
      `Address: ${address.line || "-"}`,
      `Pincode: ${address.pincode || "-"}`,
    ].join("\n");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [cart, total, itemsTotal, address, shipping]);

  // Business identity for invoices — edit before going live
  const FOUNDER_NAME = "Manisha D Shetty";

  const placeOrder = async () => {
    if (!addressComplete || cart.length === 0 || (shipping && shipping.error)) {
      if (!validName) showToast("Enter a valid name using letters only");
      else if (!validPhone) showToast("Enter a valid 10-digit Indian mobile number");
      else if (!validPincode) showToast("Enter a valid 6-digit delivery pincode");
      else if (shipping && shipping.error) showToast("Delivery is not available for this order/pincode");
      else showToast("Please complete your delivery details first");
      return;
    }

    try {
      const order = await createOrder({
        customer: { ...address },
        items: cart.map((c) => ({
          description: c.productName,
          category: "Nutrition",
          quantity: `${c.tierLabel} × ${c.qty}`,
          amount: c.price * c.qty,
        })),
        shippingAmount: shippingCharge,
        total,
      });

      const lines = cart.map(
        (c) => `• ${c.productName} — ${c.tierLabel} × ${c.qty} — Rs.${c.price * c.qty}`
      );

      const msg = [
        "Hi EAT ONE! I'd like to place this order:",
        "",
        `🟢 ORDER ID: ${order.orderId}`,
        "Copy this Order ID for payment confirmation and invoice.",
        "",
        "ORDER DETAILS",
        ...lines,
        "",
        `Items total: Rs.${itemsTotal}`,
        `Shipping: Rs.${shippingCharge}`,
        `Grand total: Rs.${total}`,
        "",
        "DELIVERY DETAILS",
        `Name: ${address.name}`,
        `Phone: ${address.phone}`,
        `Address: ${address.line}`,
        `Pincode: ${address.pincode}`,
        "",
        `Order ID: ${order.orderId}`,
      ].join("\n");

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
    } catch (error) {
      console.error("Order creation failed:", error);
      showToast("Could not generate Order ID. Please make sure the Node.js server is running.");
    }
  };



  return (
    <div className="min-h-screen pt-[68px] md:pt-[76px] overflow-x-hidden" style={{ background: CREAM, color: DARK, fontFamily: "'Inter', sans-serif", colorScheme: "light" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .eo-display { font-family: 'Playfair Display', serif; }
        .eo-display-italic { font-family: 'Playfair Display', serif; font-style: italic; }
        .eo-mono { font-family: 'IBM Plex Mono', monospace; }
        .eo-scrollbar::-webkit-scrollbar { height: 6px; }
        .eo-scrollbar::-webkit-scrollbar-thumb { background: #D9775555; border-radius: 4px; }
        .eo-input { background: #F8F3E9; border: 1px solid #2A201622; border-radius: 10px; padding: 9px 12px; font-size: 13px; width: 100%; }
        .eo-input:focus { outline: none; border-color: #CB6A35; }
        @keyframes orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit-counter-spin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        html, body { overflow-x: hidden; max-width: 100%; }
      `}</style>

      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur border-b" style={{ background: "#F8F3E9EE", borderColor: "#2A201618" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-3 items-center px-5 py-3.5">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Menu">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button type="button" onClick={() => scrollToId("reels")} className="hover:opacity-70">Watch</button>
              <button type="button" onClick={() => scrollToId("nutrition")} className="hover:opacity-70">Nutrition</button>
            </nav>
          </div>
          <button type="button" onClick={() => window.location.reload()} className="flex justify-center">
            <span className="rounded-full px-2.5 py-1" style={{ background: "#FFFFFF" }}>
              <img src={BRAND_LOGO} alt="EAT ONE" className="h-8 md:h-9 object-contain block" />
            </span>
          </button>
          <div className="flex items-center justify-end gap-5">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button type="button" onClick={() => scrollToId("why")} className="hover:opacity-70">Why</button>
              <button type="button" onClick={() => scrollToId("faq")} className="hover:opacity-70">FAQ</button>
            </nav>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: DARK }}
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Your box</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "#B65C3F" }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col px-5 pb-4 gap-3 text-sm font-medium" style={{ borderTop: "1px solid #2A201618" }}>
            <button type="button" className="pt-3 text-left" onClick={() => scrollToId("reels")}>Watch</button>
            <button type="button" className="text-left" onClick={() => scrollToId("nutrition")}>Nutrition</button>
            <button type="button" className="text-left" onClick={() => scrollToId("why")}>Why</button>
            <button type="button" className="text-left" onClick={() => scrollToId("faq")}>FAQ</button>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="max-w-6xl mx-auto px-5 pt-14 pb-16 md:pt-20 md:pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase mb-7" style={{ background: BADGE_GREEN_BG, color: SAGE_GREEN }}>
          <Sparkles size={13} /> Healthy delight, everyday
        </div>
        <h1 className="eo-display text-[2.6rem] leading-[1.08] md:text-6xl font-semibold max-w-3xl mx-auto">
          One ladoo. <em className="eo-display-italic" style={{ color: SAGE_GREEN, fontStyle: "italic" }}>A daily ritual</em> of goodness.
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-base md:text-lg" style={{ color: MUTED }}>
          Hand-rolled in small batches with nuts, seeds and natural ingredients — four recipes, one honest habit.
        </p>
        <div className="mt-9"><HeroArt /></div>
        <button type="button" onClick={() => scrollToId("products")} className="mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-md" style={{ background: "#CB6A35" }}>
          Build your box
        </button>
      </section>

      {/* STATS */}
      <section className="border-y" style={{ borderColor: "#2A201615", background: BAND }}>
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex items-center justify-center gap-2 mb-6 text-sm">
            <span style={{ color: STAR_GOLD, letterSpacing: "1px" }}>★★★★★</span>
            <span style={{ color: MUTED }}>Rated 4.9 by our family</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ["5000+", "Ladoos served"],
              ["365 days", "Daily nutrition habit"],
              ["12+", "Premium ingredients"],
              ["Daily", "Handcrafted fresh"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="eo-display text-2xl md:text-3xl font-semibold" style={{ color: SAGE_GREEN }}>{n}</div>
                <div className="text-[11px] md:text-xs mt-1 tracking-wide uppercase" style={{ color: MUTED }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REELS */}
      <section id="reels" className="max-w-6xl mx-auto px-5 py-16 md:py-20 scroll-mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: SAGE_GREEN }}>Watch</div>
            <h2 className="eo-display text-3xl md:text-4xl font-semibold mt-2">From our kitchen, to your feed.</h2>
          </div>
          <a href={BRAND_INSTAGRAM} target="_blank" rel="noreferrer" className="hidden sm:block text-sm font-medium shrink-0" style={{ color: MUTED }}>
            @eat.one1 →
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <a
              key={i}
              href={BRAND_INSTAGRAM}
              target="_blank"
              rel="noreferrer"
              className="relative aspect-[9/13] rounded-2xl overflow-hidden flex items-center justify-center group"
              style={{ background: `linear-gradient(160deg, ${SAGE_GREEN}dd, ${DARK})` }}
            >
              <span className="absolute top-3 left-3 text-[10px] font-semibold text-white/90 bg-black/30 rounded-full px-2 py-0.5">REEL</span>
              <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play size={18} fill={DARK} color={DARK} />
              </div>
              <span className="absolute bottom-9 text-xs font-semibold text-white">Watch on Instagram</span>
              <span className="absolute bottom-3 left-3 text-xs text-white/80">@eat.one1</span>
            </a>
          ))}
        </div>
      </section>
      <section id="products" className="max-w-6xl mx-auto px-5 py-16 md:py-20 scroll-mt-24">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: SAGE_GREEN }}>Mix & match</div>
          <h2 className="eo-display text-3xl md:text-4xl font-semibold mt-2">Pick your ladoo, then a size.</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProductId(p.id)}
              className="rounded-full px-4 py-2 text-sm font-semibold border transition"
              style={
                activeProductId === p.id
                  ? { background: ACCENTS[p.accent].bg, color: "white", borderColor: ACCENTS[p.accent].bg }
                  : { background: "transparent", color: DARK, borderColor: "#2A201633" }
              }
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="rounded-3xl p-6 md:p-9" style={{ background: CREAM_ALT }}>
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
            <div className="flex items-center gap-4 md:w-72 shrink-0">
              <Ladoo size={72} seed={activeProduct.id} />
              <div>
                <h3 className="eo-display text-xl font-semibold leading-tight">{activeProduct.name}</h3>
                <p className="text-sm mt-1.5" style={{ color: MUTED }}>{activeProduct.blurb}</p>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex gap-3 overflow-x-auto eo-scrollbar pb-2">
                {visibleTiers.map((tier, i) => {
                  const isSelected = selectedTier[activeProduct.id] === i;
                  return (
                    <button
                      key={tier.quantity}
                      onClick={() => setSelectedTier((s) => ({ ...s, [activeProduct.id]: i }))}
                      className="flex flex-col items-center gap-2 rounded-2xl px-4 py-3.5 border-2 shrink-0 min-w-[104px] transition"
                      style={{ borderColor: isSelected ? accent.ring : "transparent", background: CREAM }}
                    >
                      <Ladoo size={18 + i * 2.6} seed={activeProduct.id * 10 + i} />
                      <span className="eo-mono text-xs font-semibold">{tier.quantity}</span>
                      {tier.minLadoos && (
                        <span className="text-[10px]" style={{ color: "#2A201677" }}>~{tier.minLadoos}-{tier.maxLadoos} pcs</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {activeProduct.prices.length > DEFAULT_VISIBLE_TIERS && (
                <button
                  onClick={() => setExpandedSizes((s) => ({ ...s, [activeProduct.id]: !s[activeProduct.id] }))}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: "#CB6A35" }}
                >
                  {isExpanded ? <>Show fewer sizes <ChevronUp size={14} /></> : <>Show more sizes (up to 5 kg) <ChevronDown size={14} /></>}
                </button>
              )}

              <div>
                <button
                  disabled={selectedTier[activeProduct.id] === undefined}
                  onClick={() => addToCart(activeProduct, activeProduct.prices[selectedTier[activeProduct.id]])}
                  className="mt-5 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-40 transition"
                  style={{ background: accent.bg }}
                >
                  <Plus size={16} /> Add to your box
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INGREDIENTS */}
      <section id="nutrition" className="max-w-4xl mx-auto px-5 py-16 md:py-20 text-center scroll-mt-24">
        <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: SAGE_GREEN }}>Daily Nutrition</div>
        <h2 className="eo-display text-3xl md:text-5xl font-semibold mt-2 leading-tight">
          A bowl of <em className="eo-display-italic" style={{ color: SAGE_GREEN, fontStyle: "italic" }}>simple, honest</em> ingredients.
        </h2>
        <p className="mt-4 max-w-md mx-auto text-sm md:text-base" style={{ color: MUTED }}>
          Nothing artificial. Nothing hidden. Just the things grandma would approve of.
        </p>
        <div className="relative mt-14 mx-auto flex items-center justify-center" style={{ width: "min(80vw, 420px)", height: "min(80vw, 420px)" }}>
          <div className="h-72 w-72 md:h-96 md:w-96 rounded-full overflow-hidden shadow-lg">
            <img src={BOWL_IMAGE} alt="Bowl of EAT ONE ladoos" className="h-full w-full object-cover" />
          </div>
          {ORBIT_INGREDIENTS.map((name, i) => {
            const duration = 28;
            const delay = -(duration / ORBIT_INGREDIENTS.length) * i;
            return (
              <div
                key={name}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: 0,
                  height: 0,
                  transform: `rotate(${(360 / ORBIT_INGREDIENTS.length) * i}deg)`,
                  animation: `orbit-spin ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                <div style={{ transform: "translate(clamp(115px, 33vw, 190px), 0)" }}>
                  <div
                    className="rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-sm"
                    style={{
                      background: CARD,
                      border: `1px solid ${SAGE_GREEN}33`,
                      color: SAGE_GREEN,
                      animation: `orbit-counter-spin ${duration}s linear infinite`,
                      animationDelay: `${delay}s`,
                    }}
                  >
                    {name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* WHY */}
      <section id="why" className="max-w-6xl mx-auto px-5 py-16 md:py-20 scroll-mt-24">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: SAGE_GREEN }}>Small habit, big shift</div>
          <h2 className="eo-display text-3xl md:text-4xl font-semibold mt-2">Small habit. <em className="eo-display-italic" style={{ fontStyle: "italic" }}>Big shift.</em></h2>
          <p className="mt-3 max-w-md mx-auto text-sm md:text-base" style={{ color: MUTED }}>
            Every EAT ONE ladoo is a nutrient-dense, wholesome bite — made for real, everyday nourishment, not just a treat.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl p-6" style={{ background: CARD, border: "1px solid #2A201610" }}>
              <div className="h-10 w-10 rounded-full flex items-center justify-center mb-4" style={{ background: BADGE_GREEN_BG }}>
                <Icon size={18} color={SAGE_GREEN} />
              </div>
              <h3 className="eo-display font-semibold text-lg">{title}</h3>
              <p className="text-sm mt-1.5" style={{ color: MUTED }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="reviews" className="border-y scroll-mt-24" style={{ borderColor: "#2A201615", background: BAND }}>
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center mb-10">
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: SAGE_GREEN }}>Loved daily</div>
            <h2 className="eo-display text-3xl md:text-4xl font-semibold mt-2">Real people. Real habits.</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: CARD }}>
                <div className="text-sm mb-3" style={{ color: STAR_GOLD, letterSpacing: "1px" }}>★★★★★</div>
                <p className="text-sm leading-relaxed italic" style={{ fontStyle: "italic" }}>{t.quote}</p>
                <div className="flex items-center gap-1.5 mt-5 text-xs font-medium" style={{ color: SAGE_GREEN }}>
                  <ShieldCheck size={13} /> Verified Customer
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-16 md:py-20 scroll-mt-24">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: SAGE_GREEN }}>Questions</div>
          <h2 className="eo-display text-3xl md:text-4xl font-semibold mt-2">Good things to know.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: "1px solid #2A201612" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm">
                {f.q}
                {openFaq === i ? <span className="text-lg leading-none shrink-0 ml-3">−</span> : <span className="text-lg leading-none shrink-0 ml-3">+</span>}
              </button>
              {openFaq === i && <div className="px-5 pb-4 text-sm" style={{ color: MUTED }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="text-center px-5 py-16 md:py-20" style={{ background: CREAM, color: DARK }}>
        <h2 className="eo-display text-3xl md:text-4xl font-semibold">
          Ready to start your <em className="eo-display-italic" style={{ color: SAGE_GREEN, fontStyle: "italic" }}>healthy habit?</em>
        </h2>
        <p className="mt-3" style={{ color: MUTED }}>One ladoo a day. That's all it takes.</p>
        <button
          type="button"
          onClick={placeOrder}
          disabled={!cart.length || !addressComplete}
          className="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: DARK }}
        >
          Send Order via WhatsApp <ArrowRight size={15} />
        </button>
      </section>

      {/* FOOTER LINKS */}
      <footer style={{ background: BAND }}>
        <div className="max-w-6xl mx-auto px-5 py-12 grid md:grid-cols-3 gap-8 text-sm text-left">
          <div>
            <div className="eo-display text-lg font-semibold">EAT ONE</div>
            <p className="mt-2 max-w-xs" style={{ color: MUTED }}>Healthy delight, everyday. Handcrafted multinutrient ladoos for your daily dose of goodness.</p>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: SAGE_GREEN }}>Shop</div>
            <div className="space-y-1.5" style={{ color: BURNT_ORANGE }}>
              <button type="button" className="block hover:opacity-70 text-left" onClick={() => scrollToId("products")}>Order Now</button>
              <button type="button" className="block hover:opacity-70 text-left" onClick={() => scrollToId("why")}>Why EAT ONE</button>
              <button type="button" className="block hover:opacity-70 text-left" onClick={() => scrollToId("faq")}>FAQs</button>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: SAGE_GREEN }}>Contact</div>
            <div className="space-y-1.5" style={{ color: BURNT_ORANGE }}>
              <div>WhatsApp: {WHATSAPP_DISPLAY}</div>
              <a href={BRAND_INSTAGRAM} className="block hover:opacity-70">Instagram @eat.one1</a>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: MUTED }}>
              <ShieldCheck size={13} /> FSSAI Registered: {FSSAI_NUMBER}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-5 pb-6 flex flex-col md:flex-row justify-between gap-2 text-xs" style={{ color: "#2A201666" }}>
          <div>© 2026 EAT ONE. Handmade with care.</div>
          <div>Healthy Delight Everyday.</div>
        </div>
      </footer>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg text-sm font-medium text-white" style={{ background: DARK }}>
          <Check size={15} color={BADGE_GREEN_BG} /> {toast}
        </div>
      )}

      {/* Floating Order Now button */}
      <a
        href={cart.length ? waLink : `https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 shadow-lg"
        style={{ background: CARD, border: "1px solid #2A201615" }}
      >
        <span className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center"><Ladoo size={36} seed={7} /></span>
        <span className="text-sm font-semibold" style={{ color: DARK }}>Order Now</span>
      </a>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm h-full flex flex-col" style={{ background: CREAM }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#2A201622" }}>
              <h3 className="eo-display font-semibold text-lg">Your box</h3>
              <button onClick={() => setCartOpen(false)}><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {cart.length === 0 ? (
                <p className="text-sm mt-8 text-center" style={{ color: "#2A201677" }}>Nothing here yet — add a pack to begin.</p>
              ) : (
                <>
                  {/* WhatsApp number — shown once items are added */}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "#3F6D3E22" }}
                  >
                    <Phone size={16} style={{ color: "#4B6043" }} />
                    <div>
                      <div className="text-xs" style={{ color: "#2A201688" }}>We'll confirm your order on</div>
                      <div className="eo-mono text-sm font-semibold">{WHATSAPP_DISPLAY}</div>
                    </div>
                  </a>

                  <div className="space-y-3">
                    {cart.map((c) => (
                      <div key={c.key} className="flex items-center gap-3 rounded-xl p-3" style={{ background: CREAM_ALT }}>
                        <Ladoo size={34} seed={c.productId} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{c.productName}</div>
                          <div className="eo-mono text-xs" style={{ color: "#2A201688" }}>{c.tierLabel} · ₹{c.price}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQty(c.key, -1)} className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: "#2A201611" }}><Minus size={12} /></button>
                          <span className="eo-mono text-sm w-4 text-center">{c.qty}</span>
                          <button onClick={() => updateQty(c.key, 1)} className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: "#2A201611" }}><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(c.key)} className="ml-1" style={{ color: "#B65C3F" }}><X size={15} /></button>
                      </div>
                    ))}
                  </div>

                  {/* Address page */}
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold mb-2">
                      <MapPin size={14} /> Delivery address <span style={{ color: "#B65C3F" }}>*</span>
                    </div>
                    <div className="space-y-2">
                      <input required className="eo-input" placeholder="Full name *" value={address.name} onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value.replace(/[^A-Za-z .\'-]/g, "") }))} />
                      <input required className="eo-input" placeholder="Phone number *" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
                      <textarea required className="eo-input" rows={2} placeholder="Address (house no, street, area, city) *" value={address.line} onChange={(e) => setAddress((a) => ({ ...a, line: e.target.value }))} />
                      <input required className="eo-input" placeholder="Pincode *" value={address.pincode} onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} />
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: "#2A201666" }}>* All fields are required to place an order.
              {address.name && !validName && <div className="text-xs mt-1" style={{color:"#B65C3F"}}>Name must contain letters only.</div>}
              {address.phone && !validPhone && <div className="text-xs mt-1" style={{color:"#B65C3F"}}>Enter a valid 10-digit Indian mobile number.</div>}
              {address.pincode && !validPincode && <div className="text-xs mt-1" style={{color:"#B65C3F"}}>Enter a valid 6-digit pincode.</div>}</p>
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-5 border-t" style={{ borderColor: "#2A201622" }}>
              <div className="flex justify-between text-sm mb-1.5">
                <span style={{ color: "#2A201688" }}>Items</span>
                <span className="eo-mono">₹{itemsTotal}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span style={{ color: "#2A201688" }}>Shipping</span>
                <span className="eo-mono">
                  {!cart.length
                    ? "—"
                    : address.pincode.trim().length < 6
                    ? "Enter pincode"
                    : shipping?.error
                    ? "To be confirmed"
                    : `₹${shipping.deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold mb-4 pt-2 border-t" style={{ borderColor: "#2A201615" }}>
                <span>Total</span>
                <span className="eo-mono font-bold text-base">₹{total}</span>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (cart.length && addressComplete) placeOrder();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
                style={{ background: cart.length && addressComplete ? "#3F6D3E" : "#3F6D3E55", cursor: cart.length && addressComplete ? "pointer" : "not-allowed" }}
              >
                <MessageCircle size={16} /> Order via WhatsApp
              </a>
              
              <p className="text-[11px] text-center mt-3" style={{ color: "#2A201666" }}>
                {cart.length && !addressComplete ? "Fill in your delivery details to continue" : "Confirms instantly via WhatsApp"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
