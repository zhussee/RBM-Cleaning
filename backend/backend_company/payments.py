def create_payment_session(order):
    from django.utils import timezone
    import requests

    url = "https://testoauth.homebank.kz/epay2/oauth2/token"
    invoice_id = f"{order.id:08d}"

    payload = {
        "grant_type": "client_credentials",
        "scope": "webapi usermanagement email_send verification statement statistics payment",
        "client_id": "test",
        "client_secret": "yF587AV9Ms94qN2QShFzVR3vFnWkhjbAK3sG",
        "invoiceID": invoice_id,
        "secret_hash": "HelloWorld123#",
        "amount": f"{order.total_amount:.2f}",
        "currency": "KZT",
        "terminal": "67e34d63-102f-4bd1-898e-370781d0074d",
        "postLink": "http://localhost:8000/api/payment/success/",
        "failurePostLink": "http://localhost:8000/api/payment/fail/"
    }

    try:
        response = requests.post(url, data=payload)
        print("🔁 Epay response:", response.status_code, response.text)
        response.raise_for_status()

        access_token = response.json().get("access_token")
        if access_token:
            order.invoice_id = invoice_id
            order.payment_token = access_token
            order.payment_token_created = timezone.now()
            order.save(update_fields=["invoice_id", "payment_token", "payment_token_created"])

        return access_token
    except requests.exceptions.RequestException as e:
        print("❌ Ошибка при запросе в Epay:", e)
        return None
