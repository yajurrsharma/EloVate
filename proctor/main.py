import base64
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from proctor_engine import ProctoringEngine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI proctoring engine
proctor = ProctoringEngine()


@app.websocket("/ws/proctor")
async def proctor_websocket(websocket: WebSocket):
  await websocket.accept()
  try:
    while True:
      data = await websocket.receive_text()

      # Strip data URL header if present from canvas base64
      if "," in data:
        _, encoded = data.split(",", 1)
      else:
        encoded = data

      img_bytes = base64.b64decode(encoded)
      np_arr = np.frombuffer(img_bytes, np.uint8)
      frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

      if frame is None:
        continue

      # Process frame through YOLO, InsightFace, and MediaPipe
      results = proctor.process_frame(frame)

      # Send telemetry results back to the React client
      await websocket.send_json(results)

  except WebSocketDisconnect:
    print("Client disconnected from proctoring stream")
  except Exception as e:
    print(f"Proctoring stream error: {e}")