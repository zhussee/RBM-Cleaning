FROM python:3.11.9-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && apt-get clean

# Установка зависимостей Python
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Копируем код приложения
COPY . .

# Запуск сервера
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
