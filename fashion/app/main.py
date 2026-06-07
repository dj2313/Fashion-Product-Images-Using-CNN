from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from contextlib import asynccontextmanager
import os

from .model import load_models, predict_image, CLASS_DISTRIBUTION, TOTAL_IMAGES, NUM_CLASSES, IMAGE_SIZE

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    load_models()
    yield

app = FastAPI(title="Fashion CNN Classifier", lifespan=lifespan)

# Allow cross-origin requests from the Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Update with your Vercel URL after deploying, e.g. ["https://fashion-app.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if os.path.exists("frontend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

# Templates
templates = Jinja2Templates(directory="app/templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    index_path = "frontend/dist/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
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
async def predict(image: UploadFile = File(...), model_name: str = Form(...)):
    # Read the file contents
    contents = await image.read()
    
    # Check if empty
    if not contents:
        return JSONResponse(status_code=400, content={"error": "Empty file uploaded"})
        
    result = predict_image(contents, model_name)
    
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
