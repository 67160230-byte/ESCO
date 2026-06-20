# ESCO — Energy-aware Static Code Analyzer for Python

เว็บแอปพลิเคชันที่วิเคราะห์โครงสร้างโค้ด Python ผ่าน Abstract Syntax Tree (AST)
เพื่อตรวจจับ Energy Anti-patterns 5 รูปแบบ แล้วแปลงผลเป็นค่าพลังงานประมาณการ
ปริมาณคาร์บอน และ Eco-Score (A–F) พร้อมคำแนะนำในการปรับปรุงโค้ด

## โครงสร้างโปรเจกต์

```
.
├── backend/                   FastAPI application (Application Layer)
│   ├── app/
│   │   ├── main.py             FastAPI entrypoint, POST /analyze endpoint
│   │   ├── knowledge_base/     JSON files (Knowledge Layer)
│   │   │   ├── anti_patterns.json
│   │   │   └── reference_constants.json
│   │   └── services/           Core logic, one file per pipeline step
│   │       ├── ast_analyzer.py        Step 1: analyzeAST()
│   │       ├── energy_estimator.py    Step 2: estimateEnergy()
│   │       ├── eco_score.py           Step 3: calculateEcoScore()
│   │       └── recommender.py         Step 4: generateRecommendations()
│   └── requirements.txt
│
└── frontend/                  React application (Presentation Layer)
    └── src/
        ├── pages/               4 screens: Input, EcoScore, CodeIssues, Recommendation
        ├── components/
        └── api/                 API client that calls the backend
```

## รันโปรเจกต์ในเครื่อง (local development)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

ทดสอบว่า backend ทำงาน: เปิด `http://localhost:8000/docs` จะเห็น Swagger UI

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## สถานะปัจจุบัน

- [x] Knowledge Base schema (5 anti-patterns + reference constants)
- [x] FastAPI skeleton + POST /analyze endpoint wiring
- [ ] AST detection rules (4 จาก 5 ยังเป็น stub — ต้อง implement ต่อ)
- [ ] Energy/Carbon formula refinement (สูตรเริ่มต้นยังต้อง validate)
- [ ] Frontend 4 หน้า (ยังไม่เริ่ม)
- [ ] Deploy (Render สำหรับ backend, Vercel สำหรับ frontend)

## Deploy แผนผัง (ฟรีทั้งหมด)

| ส่วน | บริการ |
|---|---|
| Frontend | Vercel (free tier) |
| Backend | Render (free tier) |
| Knowledge Base | ไฟล์ JSON ใน repo (ไม่ใช้ database) |
