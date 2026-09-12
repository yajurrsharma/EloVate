import cv2

import numpy as np

import mediapipe as mp

from ultralytics import YOLO

from insightface.app import FaceAnalysis



class ProctoringEngine:

    def _init_(self, yolo_weights="yolo11n.pt"):

        # 1. Object & Person Detection (YOLOv11)

        self.yolo = YOLO(yolo_weights)

        # COCO class IDs: 0 = person, 63 = laptop, 67 = cell phone, 73 = book

        self.prohibited_ids = [63, 67, 73]



        # 2. Continuous Face Verification & Anti-Spoofing (InsightFace / ArcFace)

        self.face_app = FaceAnalysis(name="buffalo_l", addons=["liveness"])

        self.face_app.prepare(ctx_id=0, det_size=(640, 640))



        # 3. Gaze Offset & Head Tracking (MediaPipe)

        self.mp_face_mesh = mp.solutions.face_mesh

        self.face_mesh = self.mp_face_mesh.FaceMesh(

            max_num_faces=1,

            refine_landmarks=True,

            min_detection_confidence=0.5,

            min_tracking_confidence=0.5

        )



    def process_frame(self, frame: np.ndarray, ref_embedding: np.ndarray = None):

        results = {

            "person_count": 0,

            "prohibited_objects": [],

            "identity_matched": True if ref_embedding is None else False,

            "is_live": True,

            "gaze_off_screen": False,

            "alerts": []

        }



        # --- 1. YOLO Detection ---

        yolo_res = self.yolo(frame, verbose=False)[0]

        person_count = 0

        detected_items = []



        for box in yolo_res.boxes:

            cls_id = int(box.cls[0])

            conf = float(box.conf[0])

            label = self.yolo.names[cls_id]



            if cls_id == 0 and conf > 0.5:

                person_count += 1

            elif cls_id in self.prohibited_ids and conf > 0.4:

                detected_items.append(label)



        results["person_count"] = person_count

        results["prohibited_objects"] = list(set(detected_items))



        if person_count == 0:

            results["alerts"].append("NO_PERSON_DETECTED")

        elif person_count > 1:

            results["alerts"].append("MULTIPLE_PERSONS_DETECTED")



        if detected_items:

            results["alerts"].append(f"PROHIBITED_OBJECTS: {', '.join(results['prohibited_objects'])}")



        # --- 2. Identity Match & Anti-Spoofing ---

        faces = self.face_app.get(frame)

        if faces:

            primary_face = faces[0]



            # Liveness Verification

            if hasattr(primary_face, "liveness"):

                results["is_live"] = bool(primary_face.liveness.is_live)

                if not results["is_live"]:

                    results["alerts"].append("SPOOF_ATTEMPT_DETECTED")



            # ArcFace Embedding Cosine Similarity Match

            if ref_embedding is not None:

                cur_emb = primary_face.embedding

                similarity = np.dot(cur_emb, ref_embedding) / (

                    np.linalg.norm(cur_emb) * np.linalg.norm(ref_embedding)

                )

                results["identity_matched"] = bool(similarity > 0.40)

                if not results["identity_matched"]:

                    results["alerts"].append("IDENTITY_MISMATCH")



        # --- 3. Iris Gaze Estimation ---

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        mesh_out = self.face_mesh.process(rgb_frame)



        if mesh_out.multi_face_landmarks:

            landmarks = mesh_out.multi_face_landmarks[0].landmark

            

            # Left eye corners (landmarks 33, 133) and Iris center (landmark 468)

            left_corner = np.array([landmarks[33].x, landmarks[33].y])

            right_corner = np.array([landmarks[133].x, landmarks[133].y])

            pupil = np.array([landmarks[468].x, landmarks[468].y])



            eye_width = np.linalg.norm(right_corner - left_corner)

            pupil_ratio = np.linalg.norm(pupil - left_corner) / (eye_width + 1e-6)



            # Flag horizontal gaze shift outside central bounds

            if pupil_ratio < 0.32 or pupil_ratio > 0.68:

                results["gaze_off_screen"] = True

                results["alerts"].append("GAZE_OFF_SCREEN")



        return results 

