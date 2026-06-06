AGENTIC BUILD PROMPT — Fashion CNN Classifier Website

## ROLE
You are a Senior Full-Stack AI Engineer.
Build a complete, runnable FastAPI + HTML website.
No placeholders. No TODOs. Every file must run first try.

## PROJECT CONTEXT
- Dataset     : Fashion Product Images (Kaggle)
- Classes     : Topwear, Shoes, Bags, Bottomwear, Watches (5 classes)
- Total imgs  : 31,035
- Custom CNN  : 3 conv blocks → saved as custom_fashion_cnn.pth
- Transfer    : MobileNetV3-Small → saved as mobilenetv3_fashion.pth
- Framework   : PyTorch
- Backend     : FastAPI + Jinja2
- Frontend    : HTML/CSS/JS (single page, no React)

## CNN ARCHITECTURE (must match exactly for .pth to load)
```python
class FashionCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.MaxPool2d(2),
            # Block 2
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2),
            # Block 3
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(128 * 28 * 28, 256), nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 5)
        )
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)
```

## DATASET STATS (hardcode these — no DB needed)
```python
CLASS_DISTRIBUTION = {
    "Topwear"   : 15401,
    "Shoes"     : 7344,
    "Bags"      : 3055,
    "Bottomwear": 2693,
    "Watches"   : 2542
}
TOTAL_IMAGES = 31035
NUM_CLASSES  = 5
IMAGE_SIZE   = 224
```

## FILE STRUCTURE TO CREATE
```
fashion-classifier/
├── app/
│   ├── main.py
│   ├── model.py
│   └── templates/
│       └── index.html
├── static/
│   ├── style.css
│   └── charts.js
├── models/
│   ├── custom_fashion_cnn.pth      ← user drops here
│   └── mobilenetv3_fashion.pth     ← user drops here
├── requirements.txt
└── README.md
```

## WHAT THE WEBSITE MUST SHOW
1. HERO SECTION
   - Project title, dataset info, 5 class names

2. DATASET SECTION
   - Bar chart: class distribution (use Chart.js)
   - Stats: total images, num classes, image size

3. MODEL ARCHITECTURE SECTION
   - Custom CNN: show 3 conv block diagram (HTML/CSS)
   - MobileNetV3: brief description + params

4. LIVE PREDICTION SECTION
   - Dropdown: choose model (Custom CNN / MobileNetV3)
   - Upload image button
   - Show: predicted class + confidence % + bar for all 5 classes

5. RESULTS SECTION
   - Embed confusion_matrix.pdf and learning_curves.pdf as <iframe>
   - Performance table: Custom CNN acc vs MobileNetV3 acc

6. METHODOLOGY SECTION
   - Pipeline steps: Load → Preprocess → Augment → Train → Evaluate

## BACKEND ENDPOINTS
```
GET  /                        → serve index.html
POST /predict                 → accept image + model_name, return JSON
GET  /stats                   → return CLASS_DISTRIBUTION + accuracies
```

## PREDICT ENDPOINT LOGIC
```python
# Input : multipart image + model_name (cnn | mobilenet)
# Steps :
#   1. Load image → PIL → resize 224x224 → normalize
#   2. Load correct model (cache both at startup)
#   3. Run inference → softmax → top class + all 5 confidences
# Output: { "class": str, "confidence": float, "all_scores": dict }
```

## NORMALIZATION (must match training)
```python
mean = [0.485, 0.456, 0.406]
std  = [0.229, 0.224, 0.225]
```

## MODEL LOADING AT STARTUP
```python
# Load BOTH models once at app startup
# Use device = cuda if available else cpu
# MobileNetV3: torchvision.models.mobilenet_v3_small(weights=None)
# Replace last layer: classifier[-1] = nn.Linear(1024, 5)
```

## ERROR HANDLING
- models/ folder missing → show clear message on /predict
- .pth not found → return { "error": "Model file not found. Drop .pth in /models folder." }
- Wrong image format → return { "error": "Upload JPG or PNG only." }

## STYLE RULES
- Dark theme: background #0f0f0f, cards #1a1a1a, accent #6366f1
- Font: Inter from Google Fonts
- Fully responsive (mobile + desktop)
- Smooth scroll between sections
- Loading spinner on prediction

## REQUIREMENTS.TXT MUST INCLUDE
```
fastapi
uvicorn
torch
torchvision
pillow
python-multipart
jinja2
```

## RUN COMMAND
```bash
uvicorn app.main:app --reload --port 8000
```

## STOP CONDITIONS
- All files created and runnable
- Both .pth files loadable
- Prediction returns valid JSON
- No hardcoded paths (use pathlib)
- No placeholder comments
- README has setup instructions

## START
Create all files now. Begin with model.py → main.py → index.html → style.css → README.md.