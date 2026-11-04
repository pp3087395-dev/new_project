# 🔍 TruthLens — AI-Powered Synthetic Image Detection

**TruthLens** is an AI-powered synthetic image detection platform designed to estimate whether an uploaded image is a real photograph or AI-generated content.

With the rapid development of generative AI, distinguishing authentic photographs from synthetic images has become increasingly difficult. TruthLens addresses this challenge using deep learning and image analysis to provide users with an AI-generation probability and a classification result.

**Team:** ECHO 404
**Project Type:** AI/ML + Full-Stack Web Application

---

## 🚀 Key Features

* **AI Image Detection:** Analyzes uploaded images using the Smaug AI Image Detector.
* **Probability Estimation:** Provides an estimated probability that an image is AI-generated.
* **Image Classification:** Categorizes results as Real or AI-generated.
* **Image Preprocessing:** Processes uploaded images before model inference.
* **Model Evaluation:** Includes evaluation using a balanced dataset of real and AI-generated images.
* **Fine-Tuning:** The project summary documents task-specific fine-tuning of the Smaug model.
* **Results Dashboard:** Presents image analysis results through a user-friendly interface.

---

## 🧠 How It Works

TruthLens follows this image-analysis workflow:

1. The user uploads an image through the frontend.
2. The frontend sends the image to the FastAPI backend.
3. The backend preprocesses the image.
4. The Smaug detection model analyzes the image.
5. Model outputs are converted into an AI-generation probability.
6. The system produces a Real or AI-generated classification.
7. The results are displayed on the frontend dashboard.

**Workflow:**

```text
             Upload Image
                  |
                  v
           React Frontend
                  |
                  v
           FastAPI Backend
                  |
                  v
          Image Preprocessing
                  |
                  v
          Smaug AI Detector
                  |
                  v
        AI-Generation Probability
                  |
                  v
        Real / AI-Generated Result
                  |
                  v
            Results Dashboard
```

---

## 🤖 AI Detection Model

TruthLens uses the **Smaug AI Image Detector** as its primary detection model.

The model analyzes visual patterns and characteristics to estimate whether an image is authentic or synthetically generated.

### Prediction Process

```text
Input Image
    |
Image Preprocessing
    |
Smaug Model
    |
Model Logits
    |
Sigmoid Function
    |
AI-Generation Probability
    |
Final Classification
```

The model's output is interpreted as follows:

* A probability closer to `0` indicates a higher likelihood of a real image.
* A probability closer to `1` indicates a higher likelihood of an AI-generated image.

Different crop configurations, including `crops=1` and `crops=3`, have been explored to balance inference speed and detection performance.

---

## 📊 Dataset and Model Evaluation

The project summary documents evaluation using the **OpenSDI evaluation dataset**.

The evaluation dataset contains images associated with multiple image-generation technologies, including:

* FLUX
* Stable Diffusion 1.5
* Stable Diffusion 2
* Stable Diffusion 3
* Stable Diffusion XL

### Dataset Composition

| Category            | Number of Images |
| ------------------- | ---------------: |
| Real Images         |            2,500 |
| AI-Generated Images |            2,500 |
| **Total**           |        **5,000** |

Google Drive was used for persistent storage of datasets, models, training logs, and evaluation results.

### Initial Model Performance

The following results are reported for the initial Smaug evaluation:

| Metric    |  Score |
| --------- | -----: |
| Accuracy  | 92.96% |
| Precision | 99.13% |
| Recall    | 86.68% |
| F1 Score  | 92.49% |

### Confusion Matrix

| Actual / Predicted |  Real | AI-Generated |
| ------------------ | ----: | -----------: |
| Real               | 2,481 |           19 |
| AI-Generated       |   333 |        2,167 |

These results indicate strong precision, while some challenging AI-generated images were classified as real.

*Note: These figures describe the initial evaluation reported in the project summary. They should not be interpreted as a guarantee of performance on every image or dataset.*

---

## 🔧 Fine-Tuning

The project summary documents further training of the pretrained Smaug model using task-specific data.

Fine-tuning aims to:

* Improve detection accuracy.
* Reduce false-negative predictions.
* Improve performance on challenging AI-generated images.
* Adapt the pretrained model to the project's target data.

### Fine-Tuning Workflow

```text
Pretrained Smaug Model
          |
          v
    Training Dataset
          |
          v
   Further Training
          |
          v
 Validation & Evaluation
          |
          v
   Best Model Weights
          |
          v
   Backend Integration
```

The documented best checkpoint path is:

```text
backend/models/smaug_partial_best.pt
```

The backend should load this checkpoint for inference when the fine-tuned model is enabled.

---

## 🛠️ Technologies Used

| Category                    | Technologies                        |
| --------------------------- | ----------------------------------- |
| Programming Language        | Python                              |
| Deep Learning               | PyTorch                             |
| AI Model                    | Smaug AI Image Detector             |
| Model Ecosystem             | Hugging Face, Sentence Transformers |
| Backend                     | FastAPI, Uvicorn                    |
| Frontend                    | React, TypeScript                   |
| Development                 | Google Colab, Google Drive          |
| Version Control             | Git, GitHub                         |
| Frontend Hosting            | Vercel                              |
| Backend Hosting Experiments | Render                              |

---

## 📁 Project Structure

The repository contains separate frontend and backend components.

```text
TruthLens/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   ├── models/
│   │   └── smaug_partial_best.pt
│   ├── requirements.txt
│   └── ...
│
├── README.md
└── .gitignore
```

*The structure above illustrates the intended organization. Adjust it to match the actual files in the repository.*

---

## ⚙️ Installation and Setup

### Prerequisites

* Python 3.10 or a compatible version required by the backend dependencies.
* Node.js and npm.
* Git.
* Sufficient memory to load the Smaug model.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd TruthLens
```

### 2. Set Up the Backend

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn app.main:app --reload
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend address displayed by Vite in your browser.

*Note: Actual startup commands and environment variables should be checked against the current repository configuration.*

---

## 🌐 Deployment

The project uses a separate frontend and backend architecture.

* **Frontend:** Vercel.
* **Backend:** FastAPI-based service.
* **Model Hosting:** Requires a host with sufficient memory and computational resources to load Smaug.

The project has explored Render for backend hosting. Further backend hosting optimization and deployment remain part of the project work.

---

## ⚠️ Limitations

* AI-enhanced real photographs may be classified as real.
* Heavy image compression can reduce detection performance.
* Model predictions are estimates, not definitive proof of authenticity.
* Model inference requires substantial memory.
* New image-generation technologies may introduce detection challenges.

---

## 🔮 Future Improvements

* Video deepfake detection.
* AI-generated audio detection.
* Support for additional image-generation models.
* Faster and more efficient inference.
* Cloud GPU deployment.
* Explainable AI visualizations.
* Multi-model detection and confidence analysis.
* Continuous model updates as generative AI evolves.

---

## 👥 Team ECHO 404

**Project:** TruthLens — AI-Powered Synthetic Image Detection

Developed as an AI/ML and full-stack web application project.

---

## 📄 License

Add the appropriate license after confirming the licensing terms of the project code, dependencies, and model weights.
