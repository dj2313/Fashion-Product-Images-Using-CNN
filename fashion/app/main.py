from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from contextlib import asynccontextmanager
import os
import pathlib

from .model import load_models, predict_image, CLASS_DISTRIBUTION, TOTAL_IMAGES, NUM_CLASSES, IMAGE_SIZE

# Resolve all paths relative to this file's location (fashion/app/main.py)
BASE_DIR = pathlib.Path(__file__).parent.parent  # -> fashion/
STATIC_DIR = BASE_DIR / "static"
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"
TEMPLATES_DIR = BASE_DIR / "app" / "templates"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    load_models()
    yield

app = FastAPI(title="Fashion CNN Classifier", lifespan=lifespan)

# Allow cross-origin requests from the Vercel frontend.
# IMPORTANT: Replace "*" with your actual Vercel URL once deployed,
# e.g. allow_origins=["https://your-app.vercel.app"]
# You can also add multiple origins: ["https://your-app.vercel.app", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static files (only if directory exists)
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

if FRONTEND_ASSETS.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_ASSETS)), name="assets")

# Templates
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    index_path = FRONTEND_DIST / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    else:
        return templates.TemplateResponse(
            request=request,
            name="index.html", 
            context={
                "stats": {
                    "total": TOTAL_IMAGES,
                    "classes": NUM_CLASSES,
                    "size": IMAGE_SIZE
                }
            }
        )

@app.post("/predict")
async def predict(
    image: UploadFile = File(...), 
    model_name: str = Form(...),
    use_gradcam: bool = Form(False)
):
    # Read the file contents
    contents = await image.read()
    
    # Check if empty
    if not contents:
        return JSONResponse(status_code=400, content={"error": "Empty file uploaded"})
        
    result = predict_image(contents, model_name, use_gradcam)
    
    return result

@app.get("/stats")
async def get_stats():
    return {
        "distribution": CLASS_DISTRIBUTION,
        "accuracies": {
            "cnn": "85.2%",
            "mobilenet": "91.4%"
        }
    }

@app.get("/recommendations")
async def get_recommendations(category: str):
    cat_lower = category.lower()
    recommendations = []
    
    # We generated images for topwear, bottomwear, shoes
    rec_dir = STATIC_DIR / "recommendations"
    if rec_dir.exists():
        for file in os.listdir(rec_dir):
            if file.startswith(cat_lower) and file.endswith(".png"):
                recommendations.append(f"/static/recommendations/{file}")
                
    # Fallback to placeholders for categories we didn't generate
    if not recommendations:
        for i in range(1, 4):
            recommendations.append(f"https://placehold.co/400x400/e2e8f0/475569?text={category}+{i}")
            
    # Always return exactly 3 for UI consistency if we only have 2 generated
    if len(recommendations) < 3 and rec_dir.exists():
        needed = 3 - len(recommendations)
        for i in range(1, needed + 1):
             recommendations.append(f"https://placehold.co/400x400/e2e8f0/475569?text={category}+Match")
             
    return {"category": category, "recommendations": recommendations[:3]}

@app.get("/{file_path:path}")
async def serve_frontend_assets(file_path: str):
    file = FRONTEND_DIST / file_path
    if file.exists() and file.is_file():
        return FileResponse(str(file))
    return JSONResponse(status_code=404, content={"error": "Not Found"})
