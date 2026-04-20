# MindBridge

A mental wellness app for tracking mood and connecting with support resources.

**School Project**

## What's Included

- **Frontend** – React app with login page
- **Backend** – Django API (mood tracking)

## How to Run

### Frontend (Login Page)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Backend

See `backend/moods/README.md` for setup instructions.

## Ai Chatbot
Rasa:
activate 2 new venv in rasa folder: .\.venv\Scripts\Activate.ps1
Terminal 1: rasa run actions
Terminal 2: python -m rasa run --enable-api --cors "*"

Run Django Server -> backend folder & venv:
Terminal 3: python manage.py runserver
Terminal 4: Run invoke to api testing:
Example:
Invoke-RestMethod -Uri "http://localhost:5005/webhooks/rest/webhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"sender":"test_user","message":"what's the weather like"}'

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/chatbot/message/" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"message":"can you help me use the website","sender":"abhi"}' 

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Django + PostgreSQL
- Rasa

## Design reference

The dashboard UI is aligned with the **MindBridge Dashboard Design** Figma file: [MindBridge Dashboard Design (Figma)](https://www.figma.com/design/I0vH4dfQ5qi0S66YO0lU66/MindBridge-Dashboard-Design). A sibling export project may live next to this repo as `MindBridge Dashboard Design` (local reference only).
