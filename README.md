## Installation Guide
Clone repository. Open IDE terminal.

Run the following commands in order. 

### Root
```bash
npm install
```

### Backend  
Create virtual environment.
```bash
cd backend

* Windows: python -m venv venv
* Mac/Linux: python3 -m venv venv

* Windows: .\venv\Scripts\activate
* Mac/Linux: source venv/bin/activate
```

Add Dependencies
```bash
pip install -r requirements.txt

cp .env.example .env
```

Configure VSCode Python Interpreter:

1. Open Command Palette
2. Python: Select Interpreter

* Windows: venv > Scripts > python.exe
* Mac/Linux: venv > bin > python


### Frontend  
```bash
cd ../frontend 
npm install
```

### How to Run Project
From root directory:
```bash
npm run start
```
* Frontend only: `npm run dev:frontend`
* Backend only: `npm run dev:backend`

## Pull Request Workflow
Create new branches to keep commit history clean.

### Branch Names 
Use lowercase and hyphens 

Use issue numbers when relevant: `issue-#/feature-name`

Example: `kevin/initial-files` `issue-9/frontend-implementation`

### Example 
1. Pull updates from repository:
git switch main
git pull

2. Create and switch to your branch:
git switch -c issue-#/feature-name

3. Commit and save as needed.
git add .
git commit -m "description "

4. Push branch to repository:
git push origin issue-#/feature-name

5. Open pull request on GitHub.

6. One review will be required by any team member prior to PR being merged into main.
