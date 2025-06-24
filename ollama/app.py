from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import speech_recognition as sr
import threading
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Initialize OpenAI client
client = OpenAI(
    api_key="eb4b1055-8e86-4286-8767-2ebdd6590df5",
    base_url="https://api.sambanova.ai/v1",
)

# Global variables for speech recognition
recognizer = sr.Recognizer()
microphone = sr.Microphone()
is_listening = False
transcribed_text = ""

# Experience levels and technology fields
EXPERIENCE_LEVELS = [
    "0-2 years (Beginner)",
    "2-5 years (Intermediate)",
    "5-10 years (Advanced)",
    "10+ years (Expert)"
]

TECHNOLOGY_FIELDS = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning/AI",
    "DevOps",
    "Cloud Computing",
    "Cybersecurity",
    "Embedded Systems",
    "Game Development",
    "Full Stack Development"
]

@app.route('/')
def index():
    return render_template('index.html', 
                         experience_levels=EXPERIENCE_LEVELS,
                         technology_fields=TECHNOLOGY_FIELDS)

@app.route('/start_listening', methods=['POST'])
def start_listening():
    global is_listening, transcribed_text
    is_listening = True
    transcribed_text = ""
    
    def listen_thread():
        global is_listening, transcribed_text
        with microphone as source:
            recognizer.adjust_for_ambient_noise(source)
            while is_listening:
                try:
                    audio = recognizer.listen(source, timeout=1, phrase_time_limit=5)
                    text = recognizer.recognize_google(audio)
                    transcribed_text += " " + text
                except sr.WaitTimeoutError:
                    continue
                except sr.UnknownValueError:
                    continue
                except Exception as e:
                    print(f"Error: {e}")
    
    threading.Thread(target=listen_thread).start()
    return jsonify({"status": "listening started"})

@app.route('/stop_listening', methods=['POST'])
def stop_listening():
    global is_listening
    is_listening = False
    return jsonify({"status": "listening stopped", "transcribed_text": transcribed_text})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message', '').strip()
    experience = data.get('experience', '')
    technology = data.get('technology', '')
    
    if not user_input:
        return jsonify({"error": "Empty message"}), 400
    
    # Start with a system message that includes the user's profile
    system_message = {
        "role": "system",
        "content": f"You are a helpful technical assistant. The user has {experience} experience in {technology}. Tailor your responses accordingly."
    }
    
    messages = [system_message]
    messages.append({"role": "user", "content": user_input})
    
    try:
        response = client.chat.completions.create(
            model="DeepSeek-R1-0528",
            messages=messages,
            temperature=0.1,
            top_p=0.1
        )

        reply = response.choices[0].message.content.strip()
        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
