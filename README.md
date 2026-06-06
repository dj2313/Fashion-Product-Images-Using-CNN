# 🧠 AI-Driven Fashion Intelligence
*Next-Generation Classification Pipeline*

An end-to-end deep learning web application powered by **FastAPI**, **PyTorch**, and a stunning **Cyberpunk UI** that classifies fashion items into 5 distinct categories in real-time.

---

## ✨ Features
- **Dual Inference Engines**: Choose between a Custom Convolutional Neural Network (CNN) backbone or a highly efficient MobileNetV3-Small model via transfer learning.
- **Real-Time Predictions**: Drag-and-drop image upload with live probability distributions.
- **Premium Cyberpunk UI**: A beautifully crafted frontend featuring glassmorphism, glowing neon accents, staggered scroll animations, and a modern "Bento Box" grid layout.
- **AI Shimmer Loading**: Immersive UI states that convey deep tensor operations.

## 🗂️ Project Structure
```text
fashion-classifier/
├── fashion/
│   ├── app/
│   │   ├── main.py            # FastAPI routing & application logic
│   │   ├── model.py           # PyTorch architecture definitions & loader
│   │   └── templates/         
│   │       └── index.html     # HTML frontend (Bento Grid)
│   ├── models/                # Trained .pth model checkpoints
│   ├── outputs/               # Jupyter notebook outputs
│   ├── static/                
│   │   ├── style.css          # Cyberpunk/Neon UI styles
│   │   ├── charts.js          # Chart.js dataset visualization
│   │   └── *.pdf              # Evaluation metrics
├── requirements.txt           # Python dependencies
└── README.md                  # Project documentation
```

## 🚀 Getting Started

### 1. Installation
Ensure you have Python 3.9+ installed. Clone this repository, then install the required dependencies:
```bash
pip install -r requirements.txt
```

### 2. Model Weights
To enable live predictions, you must place your trained PyTorch `.pth` model files into the `fashion/models/` directory:
- `fashion/models/custom_fashion_cnn.pth`
- `fashion/models/mobilenetv3_fashion.pth`

### 3. Run the Server
Launch the FastAPI Uvicorn server:
```bash
cd fashion
uvicorn app.main:app --reload --port 8000
```

### 4. Access the App
Open your browser and navigate to:
[http://localhost:8000](http://localhost:8000)

---

## 📊 Dataset Intelligence
Trained on the **Kaggle Fashion Product Images** dataset consisting of **31,035 images** across 5 categories:
- Topwear (15,401)
- Shoes (7,344)
- Bags (3,055)
- Bottomwear (2,693)
- Watches (2,542)

## 🔬 Methodology Pipeline
1. **Load**: 31K Kaggle images
2. **Preprocess**: Resize to 224x224 & Normalize via ImageNet stats
3. **Augment**: Horizontal Flip & Random Rotation
4. **Train**: Adam Optimizer & Cross-Entropy Loss
