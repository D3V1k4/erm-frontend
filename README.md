# NexERP — Wholesale Operations & CRM Portal

A modern, responsive frontend for a wholesale operations and CRM management platform.

NexERP provides a centralized interface for managing customers, products, inventory, sales challans and business follow-ups through a clean, professional B2B dashboard.

---

##  Features

###  Authentication
- Professional login interface
- Email and password authentication
- Password visibility toggle
- Form validation
- Authentication loading and error states
- Protected application interface
  

###  Dashboard
- Business overview dashboard
- Customer summary
- Product summary
- Pending challans
- Low-stock overview
- Recent operational information

###  Customer CRM
- Customer listing
- Customer search
- Customer information management
- Customer type and status
- Customer details
- Follow-up information
- Notes and business information

###  Product Management
- Product listing
- Product search
- Product information
- SKU management
- Category information
- Unit pricing
- Stock visibility
- Low-stock and out-of-stock indicators

###  Inventory
- Inventory overview
- Stock information
- Inventory movement history
- IN / OUT movement tracking
- Quantity and movement details
- Low-stock visibility

###  Sales Challans
- Challan listing
- Create new challans
- Add multiple products
- Customer selection
- Quantity management
- Available-stock visibility
- Draft challans
- Confirmed challans
- Cancelled challans
- Insufficient-stock validation
- Challan detail view

###  Responsive Design
The application is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile devices

The navigation and layouts adapt according to screen size.

---

##  UI/UX

The frontend follows a professional B2B SaaS design approach with:

- Clean dashboard layouts
- Consistent spacing
- Reusable UI components
- Responsive navigation
- Clear status badges
- Search and filtering
- Loading states
- Empty states
- Error states
- Confirmation dialogs
- Toast notifications
- User-friendly validation

The focus is on making business operations easy to understand and perform.

---

##  Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- CSS

### Backend Integration

The frontend is structured to communicate with a REST API through a centralized API service layer.

### Database

The complete application is designed to integrate with:

- PostgreSQL
- Prisma
- Neon PostgreSQL

---

## Project Structure

```text
erm-frontend/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── customers/
│   │   │   └── CustomerForm.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   │
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── Modal.tsx
│   │       ├── PageHeader.tsx
│   │       ├── Pagination.tsx
│   │       ├── SearchInput.tsx
│   │       └── States.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── CustomerDetailPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── ChallansPage.tsx
│   │   ├── ChallanCreatePage.tsx
│   │   └── ChallanDetailPage.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   ├── product.service.ts
│   │   ├── inventory.service.ts
│   │   └── challan.service.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
