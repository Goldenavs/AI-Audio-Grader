import requests

# Put your actual API key here
API_KEY = "AIzaSyDGL0KKNredfWPA_7UFlHglkvp0sVihH18"

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
payload = {
    "contents": [{"parts": [{"text": "Reply with 'API is working!'"}]}]
}

print("Testing direct connection to Google...")
response = requests.post(url, json=payload)

print(f"Status Code: {response.status_code}")
print("Response:", response.json())