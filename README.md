# Smart Paper — AI Exam Studio & Multi-Page OCR

**Smart Paper** is an intelligent, full-stack examination paper creation and management platform designed for schools, educators, and institutions. It combines AI-powered question generation (supporting multiple question formats like MCQs, True/False, Match the Following, Fill-in-the-Blanks, and Descriptive questions), multi-page optical character recognition (OCR) paper extraction, and high-fidelity PDF rendering with live vector preview.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework & Language:** React 19, TypeScript
- **Styling & UI:** Tailwind CSS v4, Lucide React Icons
- **Animations:** Motion (`motion/react`)
- **PDF Generation & Preview:** `jsPDF`, `html2canvas`, Typst Compiler (`@myriaddreamin/typst.ts`)

### **Backend**
- **Server:** Node.js, Express 4
- **TypeScript Runner & Bundler:** `tsx` (Dev), `esbuild` (Production bundler)

### **AI & Vision (OCR)**
- **AI SDK:** Google GenAI SDK (`@google/genai`)
- **Model:** `gemini-3.6-flash` (used server-side for secure OCR page scanning and structured question generation)

---

## 📦 Environment & Dependencies

### **Prerequisites**
- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **Package Manager**: `npm` `v9.0.0` or higher

### **Environment Variables**
Create a `.env` file in the root directory by copying `.env.example`:

```env
# Google Gemini API Key (Required for AI question generation & OCR scanning)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (Optional, defaults to 3000)
PORT=3000
```

---

## 🚀 How to Run & Deploy (Installation Instructions)

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd smart-paper
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment**
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Open `.env` and insert your `GEMINI_API_KEY`.

### **4. Start Development Server**
```bash
npm run dev
```
The application will start at `http://localhost:3000`.

---

## 🏗️ Building for Production & Deployment

### **1. Build the Application**
```bash
npm run build
```
This command:
1. Builds the Vite React client into static assets in `dist/`.
2. Bundles the Express `server.ts` entry point using `esbuild` into `dist/server.cjs`.

### **2. Start the Production Server**
```bash
npm start
```

### **3. Clean Build Artifacts**
```bash
npm run clean
```

### **4. Run Linter & Type Check**
```bash
npm run lint
```

---

## ✨ Key Features

- **Smart Multi-Page OCR Scan:** Upload multiple physical exam pages at once to automatically extract institution details, subject headers, marks, and structured question groups.
- **AI Question Generator:** Generate specific question types (Descriptive, MCQ with option columns, Match the Following pairs, True/False, Fill-in-the-Blanks) targeted by subject, topic, and difficulty.
- **Vector PDF Export & Live Preview:** Real-time side-by-side paper preview and vector PDF rendering for print-ready examination papers.

