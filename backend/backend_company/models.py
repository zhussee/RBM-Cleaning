# backend_company/views_ai.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import os
from backend_company.models import CleaningCompany, Service, Review  # импорт из правильного приложения

class AiChatView(APIView):
    def post(self, request):
        user_message = request.data.get("message", "")
        if not user_message:
            return Response({"reply": "Вопрос не может быть пустым."}, status=status.HTTP_400_BAD_REQUEST)
        
        headers = {
            "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json",
        }

        # Получение данных из базы — пример: последние 5 компаний, услуг и отзывов
        companies = CleaningCompany.objects.all()[:5]
        services = Service.objects.all()[:5]
        reviews = Review.objects.all()[:5]

        # Формируем контекст для ИИ (например, можно передать данные в system prompt или user prompt)
        context_info = f"""
        Компании: {', '.join([c.name for c in companies])}.
        Услуги: {', '.join([s.name_service for s in services])}.
        Отзывы: {', '.join([f'{r.company.name} - {r.rating} звезд' for r in reviews])}.
        """

        payload = {
            "model": "openai/gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Ты — ИИ-консультант для сайта RBM Cleaning. "
                        "Отвечай по-русски, чётко, кратко и только по теме: компании, уборка, услуги, стоимость, сотрудники, оплата."
                    )
                },
                {
                    "role": "user",
                    "content": context_info + "\n\nВопрос пользователя: " + user_message
                }
            ]
        }

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            reply_text = data.get("choices", [{}])[0].get("message", {}).get("content", "Нет ответа от модели.")
            return Response({"reply": reply_text})
        except requests.exceptions.RequestException as e:
            return Response({"reply": "Ошибка соединения с AI-сервисом."}, status=500)
        except Exception:
            return Response({"reply": "Неожиданная ошибка сервера."}, status=500)
