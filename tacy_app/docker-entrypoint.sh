#!/bin/bash

# Collect static files
echo "Collect static files"
python manage.py collectstatic --noinput

# Apply database migrations
echo "Apply database makemigrations"
python manage.py makemigrations

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate

echo "Create admin"
python manage.py createsuperuser --email=$DJANGO_SUPERUSER_EMAIL --noinput

echo "start server"
python manage.py runserver 0.0.0.0:8000
# python manage.py runserver