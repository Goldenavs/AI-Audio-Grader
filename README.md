AI Audio Grader Prototype

how to install:

git clone https://github.com/Goldenavs/AI-Audio-Grader.git

cd AI-Audio-Grader

winget install ffmpeg

cd backend

python -m venv venv

Create a .env file in the backend containing GEMINI_API_KEY=your_key_here (https://aistudio.google.com/app/api-keys)

pip install -r requirements.txt

cd frontend

npm install

double click run_prototype from folder (auto run)

or manually run:

cd backend

venv\Scripts\activate

python main.py or uvicorn main:app --reload

cd frontend

npm run dev
