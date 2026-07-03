# Initial App Setup Guide
Run the following commands in IDE terminal. 

## Backend  
1. Navigate to folder:
cd backend

2. Create and activate virtual environment:
python -m venv venv

* Windows: .\venv\Scripts\activate
* Mac/Linux: source venv/bin/activate

3. Install dependencies:
pip install -r requirements.txt

4. Create .env file from template:
cp .env.example .env

## Frontend  
1. Navigate to folder:
cd ../frontend 

2. Install dependencies:
npm install

## How to Run Project
1. Must navigate to frontend (split terminal for easier use):
cd frontend

2. Starts both frontend and backend concurrently:
npm run start

* Backend only: `cd backend` and `python src/main.py` 
* Frontend only: `cd frontend` and `npm run dev`

# Push to Repository
Create new branches to keep commit history clean.

## Branch Names 
Use lowercase and hyphens `yourname/feature-name`
Example: `kevin/login-registration`

## Example Workflow
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
