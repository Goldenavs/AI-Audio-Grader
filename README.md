AI Audio Grader Prototype

how to install:

git clone https://github.com/Goldenavs/AI-Audio-Video-Grader.git
cd AI-Audio-Video-Grader
cd frontend
npm install
npm run dev
cd backend

# Create a fresh virtual environment on his machine
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# OR Activate it (Mac/Linux)
# source venv/bin/activate

# Install the dependencies we saved earlier
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload