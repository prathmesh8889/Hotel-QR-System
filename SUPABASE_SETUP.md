# 🔧 Supabase Setup Guide - Real-Time Database

## Problem Solved
Your current system uses **localStorage** which is **per-device**. When a customer scans QR on mobile and places an order, it saves in mobile's localStorage. But the admin dashboard on laptop has its own localStorage, so it doesn't see the order.

**Solution:** Use **Supabase** (free cloud database) so all devices connect to the same database in real-time.

---

## 📋 Step-by-Step Setup

### Step 1: Create Supabase Account (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email

### Step 2: Create New Project (3 minutes)

1. Click "New Project"
2. Fill in:
   - **Name:** `hotel-qr-system` (or any name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you (e.g., `Southeast Asia (Singapore)` for India)
3. Click "Create new project"
4. Wait 2-3 minutes for project to initialize

### Step 3: Get Your API Keys (1 minute)

1. In your project dashboard, click **Settings** (gear icon) in left sidebar
2. Click **API**
3. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (long string)

### Step 4: Add Environment Variables (1 minute)

Create a file named `.env` in your project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Replace with your actual values from Step 3.

**⚠️ IMPORTANT:** Add `.env` to your `.gitignore` file!

```gitignore
# .gitignore
.env
.env.local
node_modules
dist
```

### Step 5: Create Database Tables (5 minutes)

1. In Supabase dashboard, click **SQL Editor** in left sidebar
2. Click "New Query"
3. Copy and paste the SQL below
4. Click "Run" (or press Ctrl+Enter)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Menu Items Table
CREATE TABLE menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '🍽️',
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables Table
CREATE TABLE tables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'dirty', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_number INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
  customer_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Table
CREATE TABLE staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'kitchen', 'waiter')),
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT '₹',
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (name, address, phone, currency, tax_rate)
VALUES ('The Grand Kitchen', '123 Culinary Street, Food District', '+91 98765 43210', '₹', 18.00);

-- Insert default staff (Admin and Kitchen)
INSERT INTO staff (name, username, password, role, phone, email)
VALUES 
  ('Admin User', 'admin', 'admin123', 'admin', '+91 98765 00001', 'admin@hotel.com'),
  ('Kitchen Staff', 'kitchen', 'kitchen123', 'kitchen', '+91 98765 00002', 'kitchen@hotel.com');

-- Insert default tables (1-10)
INSERT INTO tables (number, status)
SELECT generate_series(1, 10), 'available';

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, image_url, available)
VALUES
  ('Classic Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 249.00, 'Main Course', '🍔', true),
  ('Caesar Salad', 'Fresh romaine lettuce with parmesan and croutons', 189.00, 'Starters', '🥗', true),
  ('Margherita Pizza', 'Classic pizza with mozzarella, tomato, and basil', 349.00, 'Main Course', '🍕', true),
  ('Grilled Salmon', 'Fresh Atlantic salmon with lemon butter sauce', 599.00, 'Main Course', '🐟', true),
  ('French Fries', 'Crispy golden fries with sea salt', 149.00, 'Sides', '🍟', true),
  ('Chicken Wings', 'Spicy buffalo wings with ranch dip', 299.00, 'Starters', '🍗', true),
  ('Chocolate Cake', 'Rich dark chocolate layer cake', 199.00, 'Desserts', '🍰', true),
  ('Fresh Lemonade', 'Hand-squeezed lemonade with mint', 129.00, 'Beverages', '🍋', true),
  ('Iced Coffee', 'Cold brew coffee with cream', 149.00, 'Beverages', '☕', true),
  ('Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 399.00, 'Main Course', '🍝', true),
  ('Mushroom Soup', 'Creamy wild mushroom soup with herbs', 179.00, 'Starters', '🍄', true),
  ('Tiramisu', 'Classic Italian coffee-flavored dessert', 249.00, 'Desserts', '🍮', true),
  ('Mojito', 'Classic Cuban cocktail with fresh mint', 279.00, 'Beverages', '🍸', true),
  ('Bruschetta', 'Toasted bread with tomatoes, garlic, and basil', 199.00, 'Starters', '🥖', true),
  ('Onion Rings', 'Crispy battered onion rings with dipping sauce', 169.00, 'Sides', '🧅', true),
  ('Ice Cream Sundae', 'Three scoops with chocolate sauce and whipped cream', 199.00, 'Desserts', '🍨', true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(available);
```

### Step 6: Enable Row Level Security (Optional but Recommended)

For now, we'll keep it simple and allow all operations. In production, you should add proper authentication.

```sql
-- Disable RLS for all tables (for development)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development)
CREATE POLICY "Allow all operations on menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tables" ON tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on staff" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true) WITH CHECK (true);
```

### Step 7: Test the Connection (1 minute)

1. Run your app locally: `npm run dev`
2. Open browser console (F12)
3. You should see no errors
4. Try logging in with `admin` / `admin123`
5. If it works, you're connected to Supabase!

### Step 8: Deploy to Vercel (2 minutes)

1. Add environment variables to Vercel:
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Push your code to GitHub
3. Vercel will auto-deploy

---

## 🎯 How It Works Now

### Before (localStorage - BROKEN):
```
Mobile Phone                    Laptop (Admin)
     ↓                              ↓
localStorage (mobile)         localStorage (laptop)
     ↓                              ↓
Order saved HERE              Can't see it! ❌
```

### After (Supabase - WORKING):
```
Mobile Phone                    Laptop (Admin)
     ↓                              ↓
     └──────────┐    ┌──────────────┘
                ↓    ↓
          Supabase Database (Cloud)
                ↓
         Real-time sync ✅
```

**Now when customer places order on mobile:**
1. Order saves to Supabase cloud database
2. Admin dashboard (on laptop) receives real-time update via WebSocket
3. Order appears instantly on admin screen! 🎉

---

## 🔍 Troubleshooting

### Error: "relation does not exist"
- Run the SQL from Step 5 again
- Check table names in Supabase → Table Editor

### Error: "Invalid API key"
- Check `.env` file has correct values
- Make sure variable names start with `VITE_`
- Restart dev server after adding `.env`

### Orders not appearing in real-time
- Check Supabase → Database → Replication
- Make sure "Enable Realtime" is ON for orders table
- Check browser console for WebSocket errors

### Can't login after migration
- Check staff table has default users
- Run: `SELECT * FROM staff;` in SQL Editor
- Should see admin and kitchen users

---

## 📊 Database Schema

```
┌─────────────────┐
│   menu_items    │
├─────────────────┤
│ id (UUID)       │
│ name            │
│ description     │
│ price           │
│ category        │
│ image_url       │
│ available       │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     tables      │
├─────────────────┤
│ id (UUID)       │
│ number          │
│ status          │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     orders      │
├─────────────────┤
│ id (UUID)       │
│ table_number    │
│ customer_name   │
│ customer_phone  │
│ items (JSONB)   │
│ total_amount    │
│ status          │
│ customer_note   │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│      staff      │
├─────────────────┤
│ id (UUID)       │
│ name            │
│ username        │
│ password        │
│ role            │
│ phone           │
│ email           │
│ active          │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│    settings     │
├─────────────────┤
│ id (TEXT)       │
│ name            │
│ address         │
│ phone           │
│ currency        │
│ tax_rate        │
│ updated_at      │
└─────────────────┘
```

---

## 💰 Cost

**Supabase Free Tier:**
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth
- ✅ Unlimited API requests
- ✅ Real-time subscriptions

**For a restaurant:** This is MORE than enough! You won't need to pay anything.

---

## 🚀 Next Steps

After setup is complete:

1. ✅ Test on mobile: Scan QR, place order
2. ✅ Test on laptop: Check if order appears instantly
3. ✅ Test multiple devices: All should sync
4. ✅ Deploy to Vercel with environment variables
5. ✅ Share with real users!

---

## 📞 Support

If you get stuck:
1. Check Supabase docs: https://supabase.com/docs
2. Check browser console for errors
3. Verify `.env` variables are correct
4. Make sure SQL was run successfully

---

**You're now ready for a real-time, multi-device ordering system!** 🎉
