AI Audio Grader Prototype

how to install:

git clone https://github.com/Goldenavs/AI-Audio-Video-Grader.git

cd AI-Audio-Grader

cd frontend

npm install

npm run dev

cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload