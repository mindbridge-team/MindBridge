#MindBridge Backend 

Here are the steps to test Django backend and connection the postgres DB

1) create venv & activiate
    .\.venv\Scripts\activate
2) install requirements 
    pip install -r requirements.txt

3) set .env

4) Commands:
    python manage.py migrate
    python manage.py runserver

5) test endpoint /api/moods/