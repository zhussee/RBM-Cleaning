from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import os

class AiChatView(APIView):
    def post(self, request):
        user_message = request.data.get("message", "")
        if not user_message:
            return Response({"reply": "Вопрос не может быть пустым."}, status=status.HTTP_400_BAD_REQUEST)
        print("🔑 OPENROUTER_API_KEY =", os.getenv("OPENROUTER_API_KEY"))
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
                        "Ты — ИИ-консультант для сайта клининговой платформы RBM Cleaning. "
                        "Отвечай по-русски, чётко, кратко и только по теме: уборка, услуги, стоимость, сотрудники, оплата. "
                        "Если вопрос вне темы — скажи, что ты консультант по клинингу и не можешь помочь."
                    )
                },
                {
                    "role": "user",
                    "content": user_message
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
            reply_text = response.json()["choices"][0]["message"]["content"]
            return Response({"reply": reply_text})
        except Exception as e:
            print("❌ Ошибка AI:", str(e))
            return Response({"reply": "Ошибка при получении ответа от ИИ."}, status=500)
