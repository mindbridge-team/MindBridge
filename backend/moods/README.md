# MindBridge Backend

Django API for mood tracking.

## Setup

1. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   .venv/Scripts/activate   # Windows
   source .venv/bin/activate   # Mac/Linux
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up `.env` file with database settings.

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start server:
   ```bash
   python manage.py runserver
   ```

## Test

API endpoint: `/api/moods/`
