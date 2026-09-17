# HotelOS - Staff Management Portal

A professional enterprise-grade restaurant management system with role-based access control, real-time order tracking, and a Kanban-style kitchen display system.

## 🎯 Overview

This is a **staff-only management application** (no customer-facing pages) built with React, TypeScript, and Tailwind CSS. It features:

- **Role-based authentication** (Admin & Kitchen Staff)
- **Real-time order tracking** with Kanban board layout
- **Sound alerts** for new orders
- **Role-specific actions** in the same view
- **Professional UI/UX** with modern design patterns

## 🚀 Features

### 1. Login System
- Clean, professional login page
- Role selector (Admin / Kitchen Staff)
- Demo credentials provided
- Secure protected routes

### 2. Dashboard
- Real-time metrics (revenue, orders, tables)
- Recent orders feed
- Auto-refreshing data

### 3. Live Orders (Kanban Board)
**Three columns:**
- **New Orders** (Pending) - Kitchen can "Start Cooking"
- **Preparing** - Kitchen can "Mark Ready"
- **Ready to Serve** - Admin can "Mark Served"

**Role-based actions:**
- **Kitchen Staff:** Big action buttons to progress orders
- **Admin:** Same view + cancel orders + mark served
- **Sound alerts** when new orders arrive
- **Visual flash** for new orders
- **Delay warnings** for orders waiting >10 min

### 4. Menu Management (Admin Only)
- Add/Edit/Delete menu items
- Toggle availability
- Category filtering
- Search functionality
- Emoji icons for items

### 5. Table & QR Management (Admin Only)
- Grid view of all tables
- Status management (Available/Occupied/Dirty/Reserved)
- QR code generation for each table
- Print all QR codes
- View individual QR codes in modal

### 6. Settings (Admin Only)
- Restaurant name, address, phone
- Currency and tax rate configuration

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM v6
- **State Management:** Context API + LocalStorage
- **Icons:** Lucide React
- **QR Codes:** qrcode.react
- **Sound:** Web Audio API

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Demo Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Dashboard, Live Orders, Menu Management, Tables, Settings

### Kitchen Staff Account
- **Username:** `kitchen`
- **Password:** `kitchen123`
- **Access:** Dashboard, Live Orders (with cooking actions)

## 🎮 How to Test

1. **Login** as Admin or Kitchen Staff
2. **Navigate to Live Orders** from the sidebar
3. **Click "Simulate Order"** button in the top bar to create test orders
4. **Watch the Kanban board** update in real-time
5. **Hear the sound alert** when new orders arrive
6. **Try role-based actions:**
   - As Kitchen: Click "Start Cooking" → "Mark Ready"
   - As Admin: Click "Mark Served" or "Cancel"

## 🏗️ Architecture

### File Structure
```
src/
├── components/
│   ├── Layout/
│   │   ├── ProtectedLayout.tsx    # Main layout with sidebar
│   │   └── Sidebar.tsx            # Navigation sidebar
│   └── UI/
│       ├── LoadingSkeleton.tsx    # Loading states
│       └── StatusBadge.tsx        # Status indicators
├── context/
│   └── AuthContext.tsx            # Authentication context
├── pages/
│   ├── LoginPage.tsx              # Public login page
│   ├── DashboardPage.tsx          # Overview dashboard
│   ├── LiveOrders.tsx             # Kanban order board
│   ├── MenuManagement.tsx         # Menu CRUD (Admin)
│   ├── TableManagement.tsx        # Tables & QR (Admin)
│   └── SettingsPage.tsx           # Settings (Admin)
├── store.ts                       # Data layer (simulates backend)
├── types.ts                       # TypeScript types
└── App.tsx                        # Router setup
```

### Routing Structure
```
/login                    → Public login page
/                         → Redirects to /login
/dashboard                → Protected (both roles)
/live-orders              → Protected (both roles)
/menu-management          → Protected (admin only)
/table-management         → Protected (admin only)
/settings                 → Protected (admin only)
```

## 🎨 Design System

### Color Palette
- **Primary:** Indigo (Admin), Orange (Kitchen)
- **Status Colors:**
  - Pending: Amber/Yellow
  - Preparing: Blue
  - Ready: Emerald/Green
  - Served: Purple
  - Cancelled: Red

### Typography
- **Headings:** Bold, slate-800
- **Body:** Regular, slate-600
- **Small:** Text-sm, slate-500

### Components
- Rounded corners (rounded-xl, rounded-2xl)
- Subtle shadows (shadow-sm, shadow-md)
- Smooth transitions
- Hover states
- Loading skeletons

## 🔔 Real-time Features

### Socket.io Simulation
The system simulates real-time updates using:
- **Event listeners** that poll localStorage every 2 seconds
- **Sound alerts** using Web Audio API (configurable on/off)
- **Visual indicators** (pulsing badges, flash animations)
- **Auto-refresh** for all data

### New Order Detection
```typescript
// Detects new orders and triggers alerts
const currentIds = new Set(allOrders.map((o) => o.id));
const newIds = new Set<string>();
currentIds.forEach((id) => {
  if (!prevOrderIdsRef.current.has(id)) newIds.add(id);
});

if (newIds.size > 0) {
  setNewOrderIds(newIds);
  if (soundEnabled) playOrderAlert();
  setTimeout(() => setNewOrderIds(new Set()), 3000);
}
```

## 📱 Responsive Design

- **Mobile:** Hamburger menu, stacked layout
- **Tablet:** Collapsible sidebar
- **Desktop:** Fixed sidebar, full Kanban board

## 🎯 Key Features Explained

### 1. Kanban Board Layout
The Live Orders page uses a three-column Kanban layout:
- Each column represents an order status
- Orders move between columns as status changes
- Visual indicators show delays and new orders
- Role-specific action buttons in each card

### 2. Role-Based Actions
Both Admin and Kitchen Staff see the same Live Orders view, but with different actions:
- **Kitchen:** "Start Cooking", "Mark Ready" (progress orders)
- **Admin:** "Mark Served", "Cancel" (manage orders)

### 3. Sound Alerts
When a new order arrives:
- A beep sound plays (using Web Audio API)
- The order card flashes with a "NEW" badge
- The pending count badge animates
- Can be toggled on/off

### 4. Order Simulation
The "Simulate Order" button creates realistic test orders:
- Random table selection
- Random menu items (1-3 items)
- Random customer notes
- Realistic pricing

## 🔒 Security Notes

This is a **demo application** using localStorage for data persistence. In production:

- Replace localStorage with a real backend (Node.js/Express + MongoDB)
- Implement proper JWT authentication
- Add server-side validation
- Use Socket.io for real-time updates
- Add rate limiting and security headers
- Implement proper error handling

## 📊 Data Models

### Order
```typescript
{
  id: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  timestamp: number;
  customerNote?: string;
}
```

### MenuItem
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string; // Emoji
  available: boolean;
}
```

### Table
```typescript
{
  id: string;
  number: number;
  qrCode: string;
  status: 'available' | 'occupied' | 'dirty' | 'reserved';
}
```

## 🎓 Learning Points

This project demonstrates:
- **React Router v6** with protected routes
- **Context API** for authentication state
- **TypeScript** for type safety
- **Tailwind CSS** for modern styling
- **Real-time updates** simulation
- **Role-based access control**
- **Kanban board** UI pattern
- **Sound alerts** with Web Audio API
- **Responsive design** patterns
- **Loading states** and skeletons

## 📝 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
