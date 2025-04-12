# BE Project

This is an Python project structured to provide a backend RESTful API service. Below are the details regarding the project setup and usage.

## Project Structure

```
BE
├── data
│   ├── items.csv
│   ├── keywords.csv
│   ├── merchant.csv
│   ├── transaction_data.csv
│   └── transaction_items.csv
├── main.py
├── rag.py
├── requirement.txt
├── .env
└── README.md
```

## Getting Started

To get started with this project, follow the steps below:

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd BE
   ```

2. **For first time setup, create the virtual environment**:

   ```bash
   python -m venv venv
   ```

3. **Activate the environment**:

   **For Mac**:

   ```bash
   source venv/bin/activate
   ```

   **For Windows**:

   ```bash
   venv\Scripts\activate
   ```

4. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

5. **Create required folder and file**:

   ```bash
   data
   ├── items.csv
   ├── keywords.csv
   ├── merchant.csv
   ├── transaction_data.csv
   └── transaction_items.csv

   .env
   ```

6. **Run the server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
