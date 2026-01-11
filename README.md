# 🏢 Sami & Mahi Tower - Premium Building Management System

Sami & Mahi Tower is a modern, full-stack, and mobile-responsive Property Management System (PMS) designed to streamline residential operations. It features a premium **Glassmorphism UI** and provides dedicated portals for Owners, Managers, and Tenants.

🚀 **Live Demo:** [sami-mahi-tower-jifo.vercel.app](https://sami-mahi-tower-jifo.vercel.app/)

---

## ✨ Key Features

### 👨‍💼 Manager Dashboard (The Control Room)
- **Interactive Building Map:** Visual floor plan (A-E Floors + Ground Parking) to manage occupancy.
- **Auto-Tenant Onboarding:** One-click tenant addition from the map with auto-generated IDs.
- **Collection Thermometer:** Real-time visual tracking of monthly rent collection vs. target.
- **WhatsApp Reminders:** One-click automated WhatsApp messages for unpaid rents.
- **Digital PDF Receipts:** Generate and download professional payment receipts using `jspdf` and `html2canvas`.
- **Employee Management:** Full directory with profile pics, NID uploads (Cloudinary), and salary tracking.

### 👑 Owner Dashboard (The Executive Suite)
- **Financial Analytics:** Comprehensive charts showing yearly income, expenses, and net profit.
- **Staff Directory:** High-level view of all employees with quick-call actions.
- **Live Audit Log:** Track every major activity happening in the tower.
- **Complaint Board:** Full-width view to read and manage resident feedback easily.
- **Glossy Metrics:** Animated counters for Bank Balance, Cash with Manager, and Collection Progress.

### 👤 Tenant Portal (Resident Experience)
- **Digital Identity Card:** Premium ID card with profile photo and Resident ID.
- **Payment History:** Detailed ledger of all past payments with status indicators.
- **Notice Board:** Real-time scrolling marquee for urgent building announcements.
- **Complaints System:** Direct channel to report maintenance issues to the management.

---

## 📱 Mobile-First Experience
- **Hybrid Layout:** Sophisticated logic that displays pro-tables on Desktop and sleek Menu Cards on Mobile.
- **PWA Ready:** Installable on Android and iOS as a standalone app with custom branding and icons.
- **Smooth Navigation:** Floating glass bottom navbar for easy one-handed operation.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** [MongoDB](https://www.mongodb.com/) with Mongoose
- **Styling:** Tailwind CSS (Modern Glassmorphism Design)
- **State Management:** React Hooks (useMemo, useCallback, useEffect)
- **Image Hosting:** [Cloudinary](https://cloudinary.com/)
- **PDF Generation:** jsPDF & html2canvas
- **Authentication:** Cookie-based Role Management
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/sami-mahi-tower.git
cd sami-mahi-tower