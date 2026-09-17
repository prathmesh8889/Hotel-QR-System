# 🏨 Hotel QR System - Supabase Setup Guide

## 🎯 तुमची समस्या (Your Problem)

तुम्ही mobile वर QR scan करून order place केला, पण laptop (admin panel) वर order दिसत नाही आणि आवाज येत नाही.

**कारण:** तुमचा system localStorage वापरतो जे प्रत्येक device साठी वेगळे असते.

**उकल:** Supabase cloud database वापरा - सर्व devices एकाच database ला connect होतील आणि real-time मध्ये sync होतील.

---

## 📋 Step-by-Step Setup Guide

### Step 1: Supabase Account तयार करा (2 मिनिटे)

1. https://supabase.com वर जा
2. **"Start your project"** click करा
3. **GitHub** ने sign up करा (recommended) किंवा email ने
4. Email verify करा

### Step 2: नवीन Project तयार करा (3 मिनिटे)

1. **"New Project"** click करा
2. हे fill करा:
   - **Name:** `hotel-qr-system` (किंवा कोणतेही नाव)
   - **Database Password:** एक strong password तयार करा (साठवा!)
   - **Region:** `South Asia (Mumbai)` निवडा (India साठी best)
3. **"Create new project"** click करा
4. 2-3 मिनिटे वाट पहा (project तयार होईल)

### Step 3: API Keys घ्या (1 मिनिट)

1. Project dashboard मध्ये डाव्या बाजूला **Settings** (gear icon ⚙️) click करा
2. **API** click करा
3. हे copy करा:
   - **Project URL:** `https://xxxxx.supabase.co` (हे तुमचे URL आहे)
   - **anon public key:** `eyJhbGc...` (लांब string आहे)

### Step 4: Vercel वर Environment Variables Add करा

1. https://vercel.com/dashboard वर जा
2. तुमचा project click करा
3. **Settings** → **Environment Variables** वर जा
4. हे add करा:

```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

5. **"Save"** click करा
6. Vercel automatically redeploy करेल

### Step 5: Database Tables तयार करा (5 मिनिटे)

1. Supabase dashboard मध्ये डाव्या बाजूला **SQL Editor** click करा
2. **"New Query"** click करा
3. खालचा SQL code copy-paste करा आणि **"Run"** click करा:

```sql
-- Menu Items Table
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '🍽️',
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tables Table
CREATE TABLE tables (
  id TEXT PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  table_number INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  customer_note TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff Table
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at BIGINT NOT NULL
);

-- Settings Table
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  currency TEXT DEFAULT '₹',
  tax_rate DECIMAL(5, 2) DEFAULT 18.00
);

-- Insert default staff
INSERT INTO staff (id, name, username, password, role, phone, email, active, created_at) VALUES
('staff-1', 'Admin User', 'admin', 'admin123', 'admin', '+91-98765-00001', 'admin@hotel.com', true, EXTRACT(EPOCH FROM NOW()) * 1000),
('staff-2', 'Kitchen Staff', 'kitchen', 'kitchen123', 'kitchen', '+91-98765-00002', 'kitchen@hotel.com', true, EXTRACT(EPOCH FROM NOW()) * 1000);

-- Insert default tables (1-10)
INSERT INTO tables (id, number, status) 
SELECT 'table-' || generate_series, generate_series, 'available'
FROM generate_series(1, 10);

-- Insert default menu items
INSERT INTO menu_items (id, name, description, price, category, image_url, available) VALUES
('1', 'Classic Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 249, 'Main Course', '🍔', true),
('2', 'Caesar Salad', 'Fresh romaine lettuce with parmesan and croutons', 189, 'Starters', '🥗', true),
('3', 'Margherita Pizza', 'Classic pizza with mozzarella, tomato, and basil', 349, 'Main Course', '🍕', true),
('4', 'Grilled Salmon', 'Fresh Atlantic salmon with lemon butter sauce', 599, 'Main Course', '🐟', true),
('5', 'French Fries', 'Crispy golden fries with sea salt', 149, 'Sides', '🍟', true),
('6', 'Chicken Wings', 'Spicy buffalo wings with ranch dip', 299, 'Starters', '🍗', true),
('7', 'Chocolate Cake', 'Rich dark chocolate layer cake', 199, 'Desserts', '🍰', true),
('8', 'Fresh Lemonade', 'Hand-squeezed lemonade with mint', 129, 'Beverages', '🍋', true),
('9', 'Iced Coffee', 'Cold brew coffee with cream', 149, 'Beverages', '☕', true),
('10', 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 399, 'Main Course', '🍝', true),
('11', 'Mushroom Soup', 'Creamy wild mushroom soup with herbs', 179, 'Starters', '🍄', true),
('12', 'Tiramisu', 'Classic Italian coffee-flavored dessert', 249, 'Desserts', '🍮', true),
('13', 'Mojito', 'Classic Cuban cocktail with fresh mint', 279, 'Beverages', '🍸', true),
('14', 'Bruschetta', 'Toasted bread with tomatoes, garlic, and basil', 199, 'Starters', '🥖', true),
('15', 'Onion Rings', 'Crispy battered onion rings with dipping sauce', 169, 'Sides', '🧅', true),
('16', 'Ice Cream Sundae', 'Three scoops with chocolate sauce and whipped cream', 199, 'Desserts', '🍨', true);

-- Insert default settings
INSERT INTO settings (id, name, address, phone, currency, tax_rate) VALUES
('default', 'The Grand Kitchen', '123 Culinary Street, Food District', '+91 98765 43210', '₹', 18.00);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- Allow all operations (for development)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tables" ON tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on staff" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true) WITH CHECK (true);
```

### Step 6: Test करा! 🎉

1. तुमची website उघडा (Vercel URL)
2. Login करा (admin / admin123)
3. आता दुसऱ्या device वर (mobile) QR scan करा
4. Order place करा
5. Laptop वर admin dashboard उघडा
6. **Order लगेच दिसला पाहिजे आणि आवाज आला पाहिजे!** 🔔

---

## 🔄 कसं काम करतं (How it works now)

### आधी (Before):
```
Mobile → Mobile localStorage → Order save
Laptop → Laptop localStorage → Order नाही ❌
```

### आता (After Supabase):
```
Mobile ──┐
         ├──→ Supabase Cloud DB ──→ Real-time sync ✅
Laptop ──┘
```

जेव्हा customer mobile वर order place करतो:
1. Order Supabase cloud database मध्ये save होतो
2. Admin dashboard (laptop) ला **instant update** मिळतो (WebSocket ने)
3. Order **लगेच** admin ला दिसतो आणि आवाज येतो! 🔔

---

## 💰 खर्च (Cost)

**Supabase Free Tier:**
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth
- ✅ Unlimited API requests
- ✅ Real-time subscriptions

**एका restaurant साठी:** हे पुरेपूर आहे! **₹0 खर्च** 💰

---

## 🐛 Troubleshooting

### Problem: Order दिसत नाही
**Solution:**
1. Vercel मध्ये environment variables check करा
2. Supabase dashboard मध्ये orders table मध्ये data आहे का check करा
3. Browser console (F12) मध्ये errors बघा

### Problem: Real-time updates नाहीत
**Solution:**
1. Supabase → Database → Replication check करा
2. "Enable Realtime" ON आहे का बघा
3. Browser console मध्ये WebSocket errors बघा

### Problem: Login होत नाही
**Solution:**
1. Staff table मध्ये default users आहेत का check करा
2. SQL run केलं आहे का बघा
3. `SELECT * FROM staff;` run करा SQL Editor मध्ये

---

## 📞 Support

जर अडचण आली तर:
1. Supabase docs: https://supabase.com/docs
2. Browser console (F12) मध्ये errors बघा
3. Vercel deployment logs check करा

---

**तुमचा system आता पूर्णपणे काम करतो!** 🚀

Mobile वर QR scan → Order place → Laptop वर लगेच दिसतो + आवाज येतो!
