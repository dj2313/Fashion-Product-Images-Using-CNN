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
    "Bottomwear": 2693,
    "Shoes": 7344,
    "Bags": 3055,
    "Watches": 2542
}
TOTAL_IMAGES = 31035
NUM_CLASSES = 5
IMAGE_SIZE = 64

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
            nn.Dropout(0.5),
            nn.Linear(128, 5)
        )
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

# Custom CNN Transform (trained on 64x64)
cnn_transform = transforms.Compose([
    transforms.Resize((64,64)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# MobileNetV3 Transform (trained on 224x224)
mobilenet_transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Global models cache
loaded_models = {
    "cnn": None,
    "mobilenet": None
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_models():
    # Get the directory where this file is located, then go up to find models/
    current_dir = pathlib.Path(__file__).parent.parent  # app/ -> fashion/
    models_dir = current_dir / "models"
    
    # 1. Load Custom CNN
    cnn_path = models_dir / "custom_fashion_cnn.pth"
    try:
        custom_cnn = FashionCNN()
        custom_cnn.load_state_dict(torch.load(cnn_path, map_location=device))
        custom_cnn.to(device)
        custom_cnn.eval()
        loaded_models["cnn"] = custom_cnn
        print(f"[OK] Loaded Custom CNN from {cnn_path}")
    except Exception as e:
        print(f"[FAIL] Could not load Custom CNN from {cnn_path}: {e}")

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
        print(f"[OK] Loaded MobileNetV3 from {mobilenet_path}")
    except Exception as e:
        print(f"[FAIL] Could not load MobileNetV3 from {mobilenet_path}: {e}")

import numpy as np

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        self.target_layer.register_forward_hook(self.save_activation)
        self.target_layer.register_full_backward_hook(self.save_gradient)
        
    def save_activation(self, module, input, output):
        self.activations = output
        
    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]
        
    def generate_heatmap(self, input_tensor, class_idx):
        self.model.eval()
        output = self.model(input_tensor)
        self.model.zero_grad()
        
        loss = output[0, class_idx]
        loss.backward()
        
        gradients = self.gradients.cpu().data.numpy()[0]
        activations = self.activations.cpu().data.numpy()[0]
        
        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]
            
        cam = np.maximum(cam, 0)
        target_size = (input_tensor.shape[2], input_tensor.shape[3])
        cam = torch.nn.functional.interpolate(
            torch.tensor(cam).unsqueeze(0).unsqueeze(0), size=target_size, mode='bilinear'
        ).squeeze().numpy()
        
        cam = cam - np.min(cam)
        if np.max(cam) != 0:
            cam = cam / np.max(cam)
        return cam

def predict_image(image_bytes: bytes, model_name: str, use_gradcam: bool = False):
    if model_name not in loaded_models:
        return {"error": "Invalid model name. Choose 'cnn' or 'mobilenet'."}
        
    model = loaded_models[model_name]
    if model is None:
        model_display = "Custom CNN" if model_name == "cnn" else "MobileNetV3"
        return {"error": f"{model_display} failed to load. Check server logs."}
        
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # Handle different image modes - convert to RGB
        if img.mode == 'RGBA':
            # For transparent images, create white background (matches ImageNet training)
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode != 'RGB':
            img = img.convert("RGB")
            
        if model_name == "cnn":
            input_tensor = cnn_transform(img).unsqueeze(0).to(device)
            target_layer = model.features[-3]
        else:
            input_tensor = mobilenet_transform(img).unsqueeze(0).to(device)
            target_layer = model.features[-1]
            
        cam_extractor = None
        if use_gradcam:
            cam_extractor = GradCAM(model, target_layer)
        
        # We need gradients for GradCAM, so we can't use torch.no_grad() if use_gradcam is True
        context = torch.enable_grad() if use_gradcam else torch.no_grad()
        with context:
            output = model(input_tensor)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)

            print("\n===== Prediction Scores =====")

            for i, cls in enumerate(CLASSES):
                print(f"{cls}: {float(probabilities[i]):.4f}")
            
            top_prob, top_class = torch.max(probabilities, 0)
        
        gradcam_base64 = None
        if use_gradcam and cam_extractor:
            heatmap = cam_extractor.generate_heatmap(input_tensor, top_class.item())
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt
            import base64
            
            fig, ax = plt.subplots(figsize=(4, 4))
            img_display = input_tensor[0].cpu().permute(1, 2, 0).detach().numpy()
            mean = np.array([0.485, 0.456, 0.406])
            std = np.array([0.229, 0.224, 0.225])
            img_display = std * img_display + mean
            img_display = np.clip(img_display, 0, 1)
            
            ax.imshow(img_display)
            ax.imshow(heatmap, cmap='jet', alpha=0.5)
            ax.axis('off')
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
            plt.close(fig)
            buf.seek(0)
            gradcam_base64 = base64.b64encode(buf.read()).decode('utf-8')
        
        all_scores = {CLASSES[i]: float(probabilities[i]) for i in range(NUM_CLASSES)}
        
        res = {
            "class": CLASSES[top_class.item()],
            "confidence": float(top_prob.item()) * 100,
            "all_scores": all_scores
        }
        if gradcam_base64:
            res["gradcam_image"] = f"data:image/png;base64,{gradcam_base64}"
            
        return res
    except Exception as e:
        if "cannot identify image file" in str(e).lower() or "cannot identify" in str(e).lower():
             return {"error": "Upload JPG or PNG only."}
        return {"error": f"Failed to process image: {str(e)}"}
