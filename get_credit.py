import requests

url = 'https://api.openai.com/dashboard/billing/credit_grants'
headers = {
    'Authorization': 'Bearer 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',
    'Content-Type': 'application/json',
}

response = requests.get(url, headers=headers)

print(response.text)
