from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from company.models import Company, Service, Review  # Импорты по своей модели
import requests
import os

class AiChatView(APIView):
    def post(self, request):
        user_message = request.data.get("message", "")
        if not user_message:
            return Response({"reply": "Вопрос не может быть пустым."}, status=status.HTTP_400_BAD_REQUEST)

        companies = Company.objects.all()[:5]
        services = Service.objects.all()[:5]
        reviews = Review.objects.all()[:5]

        info_text = "Вот информация о наших компаниях и услугах:\n\n"

        for company in companies:
            info_text += f"Компания: {company.name}\nОписание: {company.description}\n\n"

        for service in services:
            info_text += f"Услуга: {service.name_service}, Цена: {service.price_per_m2}₸/м², Время: {service.lead_time} мин\n"

        info_text += "\nОтзывы клиентов:\n"
        for review in reviews:
            info_text += f"Оценка: {review.rating}★ — {review.comment[:100]}\n"

        headers = {
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "openai/gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Ты — ИИ-консультант по подбору клининговых услуг на платформе RBM Cleaning. "
                        "Отвечай по-русски, кратко, ясно, только по теме: уборка, компании, услуги, цены, оплата, сотрудники. "
                        "Если вопрос вне темы — скажи, что ты не можешь помочь."
                    )
                },
                {
                    "role": "user",
                    "content": info_text + f"\n\nПользователь спрашивает: {user_message}"
                }
            ]
        }

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=20
            )
            response.raise_for_status()
            data = response.json()
            reply_text = data.get("choices", [{}])[0].get("message", {}).get("content", "Нет ответа от модели.")
            return Response({"reply": reply_text})
        except requests.exceptions.RequestException as e:
            print("❌ Ошибка HTTP:", str(e))
            return Response({"reply": "Ошибка соединения с AI-сервисом."}, status=500)
        except Exception as e:
            print("❌ Неожиданная ошибка:", str(e))
            return Response({"reply": "Неожиданная ошибка сервера."}, status=500)
