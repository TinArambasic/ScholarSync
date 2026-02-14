# Student Forum

# Student Forum" 
1. Opis projekta
Web aplikacija namijenjena studentima za postavljanje i odgovaranje na pitanja vezana uz kolegije na fakultetu. Sustav omogućuje organizaciju pitanja po godinama studija i kolegijima, autentikaciju korisnika, upload priloga, real-time komunikaciju te integraciju vanjskih API-ja.
Cilj aplikacije je olakšati komunikaciju među studentima i omogućiti strukturirano postavljanje pitanja unutar pojedinog kolegija.
________________________________________
2. Tehnologije
Frontend
•	React
• Tailwind
•	React Router
Backend
•	Node.js
•	Express
•	MongoDB 
•	JWT autentikacija
•	Socket.io
•	Multer (upload datoteka)
________________________________________
3. Arhitektura sustava
Aplikacija je podijeljena na: - Klijentski dio (React SPA) - Poslužiteljski dio (REST API + WebSocket server) - MongoDB bazu podataka
Komunikacija: - REST API za CRUD operacije - JWT za autentikaciju - Socket.io za real-time obavijesti
________________________________________
4. Model baze podataka
User
•	_id
•	username
•	email
•	password
•	role (user, admin)
•	joinedCourses Course
Year
•	_id
•	name (npr. 1. godina, 2. godina)
Course
•	_id
•	name
•	yearId
•	description
Question
•	_id
•	title
•	content
•	createdAt
•	userId
•	courseId
•	attachments []
Answer
•	_id
•	content
•	createdAt
•	userId
•	questionId
Notification
•	_id
•	userId
•	message
•	read (boolean)
•	createdAt
________________________________________
5. Funkcionalnosti
5.1 Autentikacija
•	Registracija
•	Prijava
•	JWT token
•	Zaštićene rute
•	Logout
________________________________________
5.2 Homepage
•	Lista godina studija
•	Pretraga pitanja
•	Najnovija pitanja
•	Gumb za postavljanje pitanja
________________________________________
5.3 Stranica kolegija
•	Popis pitanja za određeni kolegij
•	Join kolegij gumb
•	Filtriranje pitanja
________________________________________
5.4 Question Detail
•	Prikaz pitanja
•	Prikaz autora (Author badge)
•	Lista odgovora
•	Highlight najnovijeg odgovora
•	Dodavanje odgovora
•	Real-time osvježavanje odgovora
•	Upload slika i PDF dokumenata
________________________________________
5.5 Profile
•	Podaci o korisniku
•	Lista korisnikovih pitanja
•	Lista korisnikovih odgovora
•	Lista pridruženih kolegija
________________________________________
5.6 Notifications
•	Lista obavijesti
•	Oznaka pročitanih/nepročitanih
•	Real-time obavijest kada netko odgovori na korisnikovo pitanje
________________________________________
6. Real-time funkcionalnosti (Socket.io)
•	Emitiranje događaja kada se doda novi odgovor
•	Automatsko ažuriranje liste odgovora
•	Slanje notifikacije autoru pitanja
________________________________________
7. Upload i download
•	Upload slika i PDF-ova uz pitanje
•	Pohrana putanje u bazu
•	Preuzimanje datoteka s poslužitelja
________________________________________
8. Vanjski API
Wikipedia API
•	Dohvaćanje sažetka pojma vezanog uz kolegij
•	Poziv se izvršava s backend-a
OpenAI API
•	Generiranje prijedloga odgovora
•	Asistent za formuliranje pitanja
________________________________________
9. Sigurnost
•	Hashiranje lozinki
•	JWT autentikacija
•	Provjera autorizacije za uređivanje i brisanje sadržaja
•	Validacija podataka na backendu
________________________________________
10. Deploy

________________________________________
11. Moguća proširenja
•	Admin panel
•	Označavanje odgovora kao “riješeno”
•	Glasanje za odgovore
•	Sortiranje po popularnosti
•	Email notifikacije

## Prerequisites
- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas URI

## Server setup

1. Navigate to server directory and install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```
Edit `.env` to configure MongoDB URI if needed (default: `mongodb://127.0.0.1:27017/student_forum`)

3. Migrate initial data from `data/db.json`:
```bash
npm run migrate
```

4. Create database indexes for performance:
```bash
npm run create-indexes
```

5. Hash existing passwords (required after migration):
```bash
npm run hash-passwords
```

6. Start the API:
```bash
npm run dev
```

The API will run on `http://localhost:4000`

## Client setup

1. Navigate to client directory and install dependencies:
```bash
cd client
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```
Edit `.env` if API URL differs (default: `http://localhost:4000`)

3. Start the development server:
```bash
npm run dev
```
