# KeptCarbon

ระบบประเมินการกักเก็บคาร์บอนในสวนยางพารา

## 📁 Project Structure (Atomic Design)

```
keptcarbon/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/          # Basic building blocks (Button, Input, Icon, etc.)
│   │   │   ├── molecules/      # Combinations of atoms (StatCard, NavItem, etc.)
│   │   │   ├── organisms/      # Complex UI sections (Sidebar, Header, DataTable)
│   │   │   └── templates/      # Page layouts (DashboardTemplate, AuthTemplate)
│   │   ├── pages/              # Page components
│   │   ├── index.css           # Tailwind CSS with design tokens
│   │   └── App.jsx             # Main app with routing
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/      # API endpoints (plots, carbon, users, auth)
│   │   │   └── routes.py       # API router
│   │   ├── core/               # Configuration & database
│   │   ├── models/             # SQLAlchemy models with PostGIS
│   │   ├── schemas/            # Pydantic schemas
│   │   └── main.py             # FastAPI application
│   ├── Dockerfile
│   └── requirements.txt
│
├── database/                    # Database initialization
│   └── init/
│       └── 01_init.sql         # PostGIS schema setup
│
└── docker-compose.yml          # Docker Compose configuration
```

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Services

| Service  | Port | URL                      |
|----------|------|--------------------------|
| Frontend | 3000 | http://localhost:3000    |
| Backend  | 8000 | http://localhost:8000    |
| Database | 5432 | postgresql://localhost:5432 |

### API Documentation

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## 🛠️ Development

### Frontend Only

```bash
cd frontend
npm install
npm run dev
```

### Backend Only

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🎨 Design System

Based on **ra-admin** React theme with:

- **Primary Color**: Teal/Turquoise (#3cc2cf)
- **Rounded Cards**: 2xl border radius with soft shadows
- **Dark Sidebar**: Gradient from gray-800 to gray-900
- **Typography**: Inter + Prompt fonts

### Design Tokens (CSS Variables)

```css
--color-primary: #3cc2cf
--color-primary-dark: #2aa3af
--color-primary-light: #66d4de
--color-secondary: #7c5cfc
```

## 📊 Features

1. **Landing Page** - Hero section with CTA
2. **Authentication** - Login/Register
3. **Dashboard** - Statistics overview with charts
4. **Map Management** - Draw plots with polygon tools
5. **History** - Carbon assessment records

## 🌲 Carbon Calculation

Formula for rubber trees (Hevea brasiliensis):

```
AGB = exp(-2.134 + 2.530 * ln(DBH))
Carbon = AGB × 0.47
CO2 Equivalent = Carbon × 3.67
```

## 📝 License

MIT License
