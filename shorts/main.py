import os
import tempfile
import subprocess
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from yt_dlp import YoutubeDL
from google.cloud import speech_v1p1beta1 as speech
from google.oauth2 import service_account
import cv2
import numpy as np

app = FastAPI()

# Replace with your Google credentials JSON dict
GOOGLE_CREDS = {
    # your service account JSON here
}

# Replace with your Cloudinary credentials
CLOUDINARY_URL = "cloudinary://<api_key>:<api_secret>@<cloud_name>"

class GenerateRequest(BaseModel):
    url: str

def download_video(url: str) -> str:
    """Download YouTube video with yt-dlp, return filepath"""
    temp_dir = tempfile.mkdtemp()
    ydl_opts = {
        "format": "best[ext=mp4]/best",
        "outtmpl": f"{temp_dir}/video.%(ext)s",
        "quiet": True,
        "no_warnings": True,
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return os.path.join(temp_dir, "video.mp4")

def extract_audio(video_path: str) -> str:
    """Extract wav audio for speech recognition"""
    audio_path = video_path.replace(".mp4", ".wav")
    command = [
        "ffmpeg", "-y", "-i", video_path,
        "-ac", "1", "-ar", "44100", "-vn", audio_path
    ]
    subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return audio_path

def transcribe_audio(audio_path: str) -> str:
    credentials = service_account.Credentials.from_service_account_info(GOOGLE_CREDS)
    client = speech.SpeechClient(credentials=credentials)

    with open(audio_path, "rb") as f:
        content = f.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=44100,
        language_code="en-US",
        enable_automatic_punctuation=True,
        model="video"
    )

    response = client.recognize(config=config, audio=audio)
    transcript = " ".join([result.alternatives[0].transcript for result in response.results])
    return transcript

def create_captions(transcript: str, duration: float):
    words = transcript.split()
    word_count = len(words)
    words_per_sec = word_count / max(duration, 1)

    captions = []
    start = 0
    current_text = ""

    for word in words:
        current_text += word + " "
        if len(current_text.split()) > words_per_sec * 2:
            captions.append({
                "text": current_text.strip(),
                "start": start,
                "end": start + 2
            })
            start += 2
            current_text = ""

    if current_text:
        captions.append({
            "text": current_text.strip(),
            "start": start,
            "end": duration
        })
    return captions

def add_caption(frame, text, pos=(50, 100)):
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 1.2
    color = (255, 255, 255)
    thickness = 2
    cv2.putText(frame, text, pos, font, font_scale, color, thickness, cv2.LINE_AA)

def overlay_captions(video_path, captions, output_path, max_duration=60):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    max_frames = int(min(total_frames, max_duration * fps))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_idx = 0
    success, frame = cap.read()
    while success and frame_idx < max_frames:
        timestamp = frame_idx / fps
        active_caption = next((c for c in captions if c["start"] <= timestamp < c["end"]), None)
        if active_caption:
            add_caption(frame, active_caption["text"], pos=(50, height - 100))
        out.write(frame)
        frame_idx += 1
        success, frame = cap.read()

    cap.release()
    out.release()

def upload_to_cloudinary(filepath: str) -> str:
    import cloudinary.uploader
    cloudinary.config(cloud_name=CLOUDINARY_URL.split("@")[-1])
    response = cloudinary.uploader.upload(filepath, resource_type="video")
    return response.get("secure_url")

@app.post("/generate")
async def generate_short(req: GenerateRequest):
    try:
        video_path = download_video(req.url)
        audio_path = extract_audio(video_path)
        transcript = transcribe_audio(audio_path)

        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps
        cap.release()

        captions = create_captions(transcript, duration)
        short_path = video_path.replace(".mp4", "_short.mp4")
        overlay_captions(video_path, captions, short_path)

        video_url = upload_to_cloudinary(short_path)

        # Cleanup files as needed here...

        return JSONResponse({"videoUrl": video_url})

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

