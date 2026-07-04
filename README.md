## Installation Guide
Run the following commands in IDE terminal. 

### Root
Add dependencies.
```bash
npm install
```

### Backend  
Create virtual environment.
```bash
cd backend

python -m venv venv

* Windows: .\venv\Scripts\activate
* Mac/Linux: source venv/bin/activate
```

Add dependencies.
```bash
pip install -r requirements.txt

cp .env.example .env
```

### Frontend  
Add dependencies.
```bash
cd ../frontend 
npm install
```

### How to Run Project
Must navigate to frontend (split terminal for easier use):
```bash
cd frontend
npm run start
```
* Backend only: `cd backend` and `python src/main.py` 
* Frontend only: `cd frontend` and `npm run dev`

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
git switch -c yourname/feature-name

3. Commit and save as needed.
git add .
git commit -m "description "

4. Push branch to repository:
git push origin yourname/feature-name

5. Open pull request on GitHub.

6. One review will be required by any team member prior to PR being merged into main.
