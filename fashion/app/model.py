import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import io
import pathlib

# Hardcoded constants
CLASS_DISTRIBUTION = {
    "Topwear": 15401,
    "Shoes": 7344,
    "Bags": 3055,
    "Bottomwear": 2693,
    "Watches": 2542
}
TOTAL_IMAGES = 31035
NUM_CLASSES = 5
IMAGE_SIZE = 224

CLASSES = list(CLASS_DISTRIBUTION.keys())

# Define Custom CNN Architecture
class FashionCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 16, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            # Block 2
            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            # Block 3
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        self.classifier = nn.Sequential(
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 5)
        )
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

# Normalization based on prompt
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Global models cache
loaded_models = {
    "cnn": None,
    "mobilenet": None
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_models():
    models_dir = pathlib.Path("models")
    
    # 1. Load Custom CNN
    cnn_path = models_dir / "custom_fashion_cnn.pth"
    try:
        custom_cnn = FashionCNN()
        custom_cnn.load_state_dict(torch.load(cnn_path, map_location=device))
        custom_cnn.to(device)
        custom_cnn.eval()
        loaded_models["cnn"] = custom_cnn
        print("Loaded Custom CNN successfully.")
    except Exception as e:
        print(f"Could not load Custom CNN: {e}")

    # 2. Load MobileNetV3
    mobilenet_path = models_dir / "mobilenetv3_fashion.pth"
    try:
        mobilenet = models.mobilenet_v3_small(weights=None)
        mobilenet.classifier = nn.Sequential(
            nn.Linear(576, 128),
            nn.Hardswish(),
            nn.Dropout(0.2),
            nn.Linear(128, 5)
        )
        mobilenet.load_state_dict(torch.load(mobilenet_path, map_location=device))
        mobilenet.to(device)
        mobilenet.eval()
        loaded_models["mobilenet"] = mobilenet
        print("Loaded MobileNetV3 successfully.")
    except Exception as e:
        print(f"Could not load MobileNetV3: {e}")

def predict_image(image_bytes: bytes, model_name: str):
    if model_name not in loaded_models:
        return {"error": "Invalid model name. Choose 'cnn' or 'mobilenet'."}
        
    model = loaded_models[model_name]
    if model is None:
        return {"error": "Model file not found. Drop .pth in /models folder."}
        
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = transform(img).unsqueeze(0).to(device)
        
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            
        top_prob, top_class = torch.max(probabilities, 0)
        
        all_scores = {CLASSES[i]: float(probabilities[i]) for i in range(NUM_CLASSES)}
        
        return {
            "class": CLASSES[top_class.item()],
            "confidence": float(top_prob.item()) * 100,
            "all_scores": all_scores
        }
    except Exception as e:
        if "cannot identify image file" in str(e).lower() or "cannot identify" in str(e).lower():
             return {"error": "Upload JPG or PNG only."}
        return {"error": f"Failed to process image: {str(e)}"}
