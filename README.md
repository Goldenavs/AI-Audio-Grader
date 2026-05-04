AI Audio Grader Prototype

how to install:

git clone https://github.com/Goldenavs/AI-Audio-Grader.git

cd AI-Audio-Grader

winget install ffmpeg

cd backend

python -m venv venv

venv\Scripts\activate

Create a .env file in the backend containing GEMINI_API_KEY=your_key_here

pip install -r requirements.txt

python main.py
or
uvicorn main:app --reload

cd frontend

npm install

npm run dev
