# TacyProject


# Настройка первого админа
    1. У вас есть папка исходников 
        . 
        ├── docker-compose.yml    docker-compose Всего проекта   
        ├── nginx                 Настройки nginx
        ├── postgres              БД 
        ├── react                 Фронтенд
        ├── README.md             Мы тут
        └── tacy_app              Бекенд
            ├── back_static
            ├── back_staticfiles
            ├── ...
            ├── .env
            ├── ...

    2. В файле tacy_app/.env
        DJANGO_SUPERUSER_EMAIL = Ваша почта
        DJANGO_SUPERUSER_PASSWORD = Пароль

# Админка 
    1. Чтобы зайти в админку Djnago http://ip_server/admin, где ip_server - ваш IP 
    2. Зайти может любой админ

# Инструкция по запуску на сервере 
    1. У вас есть папка исходников 
            . 
            ├── docker-compose.yml    docker-compose Всего проекта   
            ├── nginx                 Настройки nginx
            ├── postgres              БД 
            ├── react
            │   ├── ...
            │   ├── src
            │   │   ├── ....
            │   │   ├── consts
                        └── index.ts
            │   │   ├── ...
            │   └── tsconfig.json
            ├── README.md             Мы тут
            └── tacy_app              Бекенд
            
    2. Нужно в react/src/consts/index.ts поменять последнии 2 строчки на ваш IP

    3. У вас есть папка исходников 
        . 
        ├── docker-compose.yml    docker-compose Всего проекта   
        ├── nginx                 Настройки nginx
        ├── postgres              БД 
        ├── react                 Фронтенд
        ├── README.md             Мы тут
        └── tacy_app              Бекенд
            ├── ...
            ├── tacy_app
            ├── ...
            ├── tacy_app
            │   ├── ...
            │   ├── settings.py 
            │   ├── ...

    2. В tacy_app/tacy_app/settings.py меняем IP_SERVER

    3. У вас есть папка исходников 
        . 
        ├── docker-compose.yml    docker-compose Всего проекта   
        ├── nginx                 Настройки nginx
        ├── postgres              БД 
        ├── react                 Фронтенд
        ├── README.md             Мы тут
        └── tacy_app              Бекенд
    
    4. Необходимо собрать докер и поднять его (для этого нужно скачать docker-compose)
        Например так: sudo docker-compose -f docker-compose.yml build; sudo docker-compose -f docker-compose.yml up --force-recreate

# Документацию api возможно посмотреть только в режиме DEBUG=True
    1. У вас есть папка исходников 
        . 
        ├── docker-compose.yml    docker-compose Всего проекта   
        ├── nginx                 Настройки nginx
        ├── postgres              БД 
        ├── react                 Фронтенд
        ├── README.md             Мы тут
        └── tacy_app              Бекенд
            ├── ...
            ├── tacy_app
            ├── ...
            ├── tacy_app
            │   ├── ...
            │   ├── settings.py 
            │   ├── ...
    2. Переходим в режим отладки  DEBUG=True
    3. Документация основных моментов http://ip_server:8000/swagger

# Для локального запуска 
    "Инструкция по запуску на сервере"  ip <=> localhost


