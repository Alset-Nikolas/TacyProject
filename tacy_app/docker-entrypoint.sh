#!/bin/bash

echo "Collect static files"
python tacy_app/manage.py collectstatic --noinput

echo "Apply database makemigrations"
python tacy_app/manage.py makemigrations

echo "Apply database migrations"
python tacy_app/manage.py migrate

echo "Create admin"
python tacy_app/manage.py createsuperuser --email=$DJANGO_SUPERUSER_EMAIL --noinput || echo "admin already created"

echo "Apply database static"
python tacy_app/manage.py collectstatic --noinput

echo "start server"
gunicorn tacy_app.wsgi --bind 0.0.0.0:8000 --workers 3 

exec "$@"
