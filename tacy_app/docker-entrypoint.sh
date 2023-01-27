#!/bin/bash

# Collect static files
echo "Collect static files"
python manage.py collectstatic --noinput

# Apply database migrations
echo "Apply database makemigrations"
python tacy_app/manage.py makemigrations

# Apply database migrations
echo "Apply database migrations"
python tacy_app/manage.py migrate

echo "Create admin"
python tacy_app/manage.py createsuperuser --email=$DJANGO_SUPERUSER_EMAIL --noinput

echo "start server"
python tacy_app/manage.py runserver 0.0.0.0:8000
# python manage.py runserver