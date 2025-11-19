# textreal-estate-chatbot

A small full-stack demo that provides a chatbot interface for exploring real estate data, built with a Django backend and a Vite + React (TypeScript) frontend.

**Repository Layout**
- `backend/`: Django project and API (SQLite DB: `db.sqlite3`).
- `backend/api/`: Django app containing API views, serializers, and models.
- `frontend/`: Vite + React + TypeScript SPA, UI components and assets.
- `data/`: CSVs with filtered real estate data used for import/analysis.

**Quick Start (Windows PowerShell)**

Prerequisites:
- Python 3.10+ and `pip` installed
- Node.js 16+ (or recommended Node LTS) and `npm` or `yarn`

Backend (Django)

1. From repository root, create and activate a virtual environment (PowerShell):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate
```

2. Install Python requirements and prepare the database:

```powershell
pip install -r requirements.txt
python manage.py migrate
```

3. (Optional) Load sample data if you have an import command or script. Otherwise the bundled `db.sqlite3` contains initial data.

4. Run the development server:

```powershell
python manage.py runserver 0.0.0.0:8000
```

Frontend (Vite + React)

1. Open a new terminal, switch to the frontend folder and install dependencies:

```powershell
cd frontend
npm install
```

2. Start the dev server:

```powershell
npm run dev
```

3. Build for production:

```powershell
npm run build
```

Notes on Ports/Proxy
- By default Django runs on `http://127.0.0.1:8000` and the Vite dev server runs on `http://localhost:5173` (or another port shown by Vite). If the frontend needs to call the backend during development, either use a proxy in the frontend config or call the backend's port directly.

Data
- CSV source files live in `data/` (e.g., `filtered-real-estate-data.csv`). Use them for re-importing or preprocessing.

API
- API endpoints are implemented in `backend/api/` — see `backend/api/urls.py`, `views.py`, and `serializers.py` for available endpoints and request/response shapes.

Running Tests

```powershell
cd backend
.\.venv\Scripts\Activate
python manage.py test
```

Contributing
- Create an issue describing the change or bug.
- Open a pull request with a clear description, tests (if applicable), and small commits.

Helpful Files
- `backend/requirements.txt` — Python dependencies.
- `frontend/package.json` — frontend dependencies and scripts.
- `backend/manage.py` — Django management entrypoint.
- `data/` — example CSVs used by the project.

Troubleshooting
- If `npm run dev` fails, ensure Node version is compatible and run `npm install` again.
- For Python dependency issues, recreate the virtualenv and re-run `pip install -r requirements.txt`.

License
- This repository does not include a license by default. Add a `LICENSE` file if you intend to open-source the project.

Questions or Next Steps
- Want me to add a contribution guideline, environment variable example, or API reference? I can generate those next.
# Mini Real Estate Analysis Chatbot

Executive-grade conversational analytics assistant built for the **SigmaValue Full Stack Developer Assignment (2025)**. It combines a Django REST API, a Vite/React/TypeScript frontend, and a curated Pune micro-market dataset to answer natural-language real estate queries with narrative summaries, interactive charts, and exportable tables.

---

## ✨ Feature Highlights

- **Dataset-first intelligence** &mdash; default Excel file lives in `backend/data/real_estate_data.xlsx` and can be overridden per request via drag-and-drop upload.
- **Smart query parsing** &mdash; regex + keyword heuristics detect locations, timeframes, and metrics (sales, inventory, rates, etc.) before slicing with pandas.
- **Rich responses** &mdash; backend returns summary, chart-ready data, paginated table rows, and preferred chart type. Frontend renders a ChatGPT-inspired card with Markdown, Chart.js visual, TanStack table, and CSV export.
- **OpenAI-enhanced narratives** &mdash; plug in `OPENAI_API_KEY` for GPT-powered summaries; otherwise fall back to a realistic deterministic writer.
- **Delightful UI** &mdash; Tailwind + shadcn-inspired components, dark/light toggle, typing indicator, auto-scroll, responsive layout, and mobile-friendly interactions.
- **Deploy-ready** &mdash; CORS-hardened Django server plus Vite build that can ship directly to Render (backend) and Vercel (frontend).

---

## 🧱 Project Structure

```
textreal-estate-chatbot/
├── backend/
│   ├── api/                  # Django app + pandas analysis logic
│   ├── data/real_estate_data.xlsx
│   ├── manage.py
│   ├── realestate/           # Project settings / urls
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Chat UI, charts, tables, uploads
│   │   ├── lib/utils.ts
│   │   └── App.tsx, main.tsx
│   ├── tailwind.config.js
│   └── package.json
├── README.md
└── .gitignore
```

---

## ⚙️ Prerequisites

- Python **3.11+** (backend tested on 3.10 but authored for 3.11 as per brief)
- Node.js **20+** and npm
- Excel dataset already downloaded (done) or obtainable via the provided Google Sheet link

---

## 🚀 Backend Setup (Django + DRF)

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate  # PowerShell (adjust for your OS)
pip install -r requirements.txt

# Run initial migrations (optional but recommended for admin/query logs)
python manage.py migrate

# Start the API
python manage.py runserver 0.0.0.0:8000
```

Environment variables (create `backend/.env`):

| Key | Description | Example |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Secret key for production | `replace-me` |
| `DJANGO_DEBUG` | `True`/`False` | `True` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |
| `OPENAI_API_KEY` | Optional; enables GPT summaries | `sk-...` |
| `OPENAI_MODEL` | Model name | `gpt-4o-mini` |
| `REAL_ESTATE_DATA_FILE` | Override dataset path | `C:/data/custom.xlsx` |

API contract:

```
POST /api/analyze/
Content-Type: multipart/form-data
{
  "query": "Compare Wakad & Baner last 3 years",
  "file": <optional .xlsx upload>
}
```

Response:

```json
{
  "summary": "Natural language insight...",
  "chart_data": {
    "labels": ["2022", "2023", "2024"],
    "datasets": [{ "label": "Wakad (flat - weighted average rate)", "data": [7200, 7550, 7800] }]
  },
  "table_data": [
    {
      "final_location": "Wakad",
      "year": 2024,
      "metric_value": 7800,
      "total_units": 1200,
      "total_sales": 950
    }
  ],
  "chart_type": "line"
}
```

---

## 💻 Frontend Setup (Vite + React + shadcn)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle
```

Environment variables (create `frontend/.env`):

```
VITE_API_BASE_URL=http://localhost:8000
```

Features delivered:

- Chat bubbles for user/bot, Markdown summaries, Chart.js (line/bar) with dark-mode palette
- TanStack table w/ sorting + pagination + CSV export
- Drag-and-drop Excel upload + typing indicator + auto-scroll
- Theme toggle, gradients, glassmorphism, mobile breakpoints

---


## 🧪 Quality & Tooling

- **Linting**: `npm run lint` for frontend, `ruff`/`flake8` can be added easily for backend.
- **Testing**: `python manage.py test` contains a placeholder suite; extend with API tests as needed.
- **Data validation**: pandas enforces schema + sanitizes nulls before JSON serialization.

---




