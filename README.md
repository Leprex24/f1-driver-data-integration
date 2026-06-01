# F1 Driver Data Integration

Aplikacja analityczna do porównywania kierowców Formuły 1 na podstawie danych telemetrycznych, pogodowych i statystycznych z sezonów 2021–2024.

---

## Opis projektu

Projekt integruje dane z wielu heterogenicznych źródeł:
- **fastf1** – biblioteka Python pobierająca dane telemetryczne bezpośrednio z API Formuły 1 (czasy okrążeń, sektory, opony, pogoda, wyniki)
- **Ręcznie przygotowane dane statyczne** – dostawcy silników i przypisania zespołów do silników per sezon (dane niedostępne w fastf1)

Dane są normalizowane, zapisywane do relacyjnej bazy danych i udostępniane przez REST API z warstwą graficzną umożliwiającą interaktywne porównania.

---

## Technologie

### Backend
- **Python 3.11**
- **FastAPI** – REST API
- **SQLAlchemy** – ORM z obsługą transakcji i poziomów izolacji
- **SQLite** – baza danych
- **fastf1** – klient do API Formuły 1
- **python-jose** – tokeny JWT
- **passlib[bcrypt]** – hashowanie haseł

### Frontend
- **React** + **Vite**
- **Recharts** – wykresy
- **react-router-dom** – nawigacja

### Infrastruktura
- **Docker** + **Docker Compose**
- **nginx** – serwowanie frontendu

---

## Wymagania

### Uruchomienie przez Docker (zalecane)
- Docker Desktop

### Uruchomienie lokalne
- Python 3.11+
- Node.js 20+
- Git

---

## Uruchomienie przez Docker

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/TWOJ_USERNAME/f1-driver-data-integration.git
cd f1-driver-data-integration
```

### 2. Utwórz plik `.env`

```bash
DATABASE_URL=sqlite:///./f1.db
SECRET_KEY=twoj_tajny_klucz_minimum_32_znaki
ALGORITHM=HS256
```

### 3. Uruchom aplikację

```bash
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:8000`
- Dokumentacja API (Swagger): `http://localhost:8000/docs`

---

## Uruchomienie lokalne

### Backend

```bash
# Utwórz i aktywuj środowisko wirtualne
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac

# Zainstaluj zależności
pip install -r requirements.txt

# Utwórz plik .env
echo DATABASE_URL=sqlite:///./f1.db > .env
echo SECRET_KEY=twoj_tajny_klucz >> .env
echo ALGORITHM=HS256 >> .env

# Uruchom serwer
uvicorn app.main:app --reload
```

### Frontend

```bash
cd f1-frontend
npm install
npm run dev
```

Frontend dostępny na `http://localhost:5173`.

---

## Pierwsze uruchomienie – konfiguracja danych

### 1. Utwórz konto administratora

Wejdź na `http://localhost:8000/docs`, znajdź endpoint `POST /auth/register` i utwórz użytkownika:

```json
{
  "username": "admin",
  "password": "twoje_haslo",
  "role": "admin"
}
```

### 2. Załaduj dane statyczne

Zaloguj się jako admin w aplikacji, przejdź do zakładki **ADMIN** i kliknij **SEED STATIC DATA**. Spowoduje to załadowanie dostawców silników i przypisań silnik–zespół dla sezonów 2021–2024.

### 3. Załaduj dane sesji

W zakładce **ADMIN** dostępne są dwie opcje:

**LOAD SESSION** – ładuje pojedynczą sesję:
- Podaj rok (2021–2024)
- Podaj nazwę Grand Prix (np. `Monza`, `Monaco`, `Bahrain`)
- Wybierz typ sesji (Race / Qualifying)

**LOAD DEFAULT SESSIONS** – ładuje predefiniowany zestaw sesji:
- Bahrain, Monaco, Baku, Monza, Abu Dhabi
- Silverstone (2021) / Suzuka (2022–2024)
- Tylko wyścigi (Race)
- Działa w tle, postęp widoczny w logach serwera

> **Uwaga:** Ładowanie danych wymaga połączenia z internetem i może trwać kilka minut na sesję ze względu na limit API (500 requestów/h). Dane są cachowane lokalnie po pierwszym pobraniu.

---

## Struktura projektu

```
f1-driver-data-integration/
├── app/
│   ├── models/          # Modele ORM (SQLAlchemy)
│   ├── routers/         # Endpointy REST API
│   ├── schemas/         # Schematy Pydantic
│   ├── services/        # Logika biznesowa
│   │   ├── f1_data_service.py      # Integracja z fastf1
│   │   ├── comparison_service.py   # Analiza porównawcza
│   │   └── auth_service.py         # JWT + hashowanie
│   ├── scripts/         # Skrypty pomocnicze
│   │   ├── seed_static_data.py     # Dane statyczne
│   │   └── load_all_sessions.py    # Bulk load sesji
│   ├── database.py      # Konfiguracja bazy danych
│   └── main.py          # Punkt wejścia aplikacji
├── f1-frontend/
│   └── src/
│       ├── pages/       # Strony React
│       ├── components/  # Komponenty współdzielone
│       └── services/    # Klient API
├── Dockerfile           # Docker dla backendu
├── docker-compose.yml   # Orkiestracja kontenerów
└── requirements.txt
```

---

## Funkcjonalności

### Dashboard
- Przegląd załadowanych sesji (wyścigi i kwalifikacje)
- Filtrowanie po typie sesji
- Statystyki: liczba sesji, wyścigów, torów, sezonów
- Kliknięcie na sesję przenosi do porównania z wstępnie wypełnionymi parametrami

### Porównanie kierowców (Compare)
Dwa tryby porównania:

**SUMMARY** – ogólne statystyki:
- Średni czas okrążenia
- Najszybsze okrążenie
- Średnie czasy sektorów (S1, S2, S3)
- Średni czas per mieszanka opon z deltą
- Warunki pogodowe (temperatura powietrza i toru, opady)
- Informacje o torze (typ nawierzchni, charakterystyka)
- Porównanie jednostek napędowych

**DETAILED** – szczegółowa analiza z filtrami:
- Zakres okrążeń (lap from / lap to)
- Filtr po mieszance opon
- Wykres czasów okrążeń z możliwością zoomu (drag-to-zoom)
- Wykres czasów sektorowych
- Analiza zmian pogody w trakcie sesji (temperatura, wilgotność, prędkość wiatru)

**TEAM MODE** – automatyczne wypełnienie kierowców z wybranego zespołu dla danej sesji

### Kierowcy (Drivers)
- Lista wszystkich kierowców z sezonów 2021–2024
- Wyszukiwanie po nazwisku, skrócie lub narodowości
- Sortowanie po numerze, nazwisku lub narodowości
- Kliknięcie na kierowcę przenosi do porównania

### Eksport (Export)
- Eksport danych sesji w formacie **JSON** (surowe dane, przyjazne dla API)
- Eksport danych sesji w formacie **XML** (czytelny dla człowieka, format raportowy)
- Podgląd eksportowanych danych w przeglądarce

### Panel administratora (Admin)
- Ładowanie pojedynczej sesji z fastf1
- Bulk load predefiniowanych sesji
- Seed danych statycznych (silniki, przypisania)
- Widoczny tylko dla użytkowników z rolą `admin`

---

## Architektura bazy danych

| Tabela | Opis |
|---|---|
| `drivers` | Kierowcy z danymi osobowymi |
| `teams` | Zespoły F1 |
| `circuits` | Tory wyścigowe z typem nawierzchni |
| `events` | Grand Prix (sezon, runda) |
| `sessions` | Sesje (wyścig, kwalifikacje) |
| `laps` | Dane okrążeń (czasy, sektory, opony) |
| `driver_session_results` | Wyniki kierowców w sesjach |
| `weather_snapshots` | Snapshoty pogody podczas sesji |
| `engine_suppliers` | Dostawcy silników |
| `team_season_engines` | Przypisania silnik–zespół per sezon |
| `users` | Użytkownicy aplikacji |

---

## API – główne endpointy

| Method | Endpoint | Opis | Autoryzacja |
|---|---|---|---|
| POST | `/auth/register` | Rejestracja użytkownika | - |
| POST | `/auth/login` | Logowanie, zwraca JWT | - |
| GET | `/drivers/` | Lista kierowców | user |
| GET | `/sessions/` | Lista sesji | user |
| POST | `/sessions/load` | Ładowanie sesji z fastf1 | admin |
| GET | `/comparisons/summary` | Ogólne porównanie | user |
| GET | `/comparisons/detailed` | Szczegółowe porównanie | user |
| GET | `/export/session/{id}/json` | Eksport JSON | user |
| GET | `/export/session/{id}/xml` | Eksport XML | user |

Pełna dokumentacja: `http://localhost:8000/docs`

---

## Poziomy izolacji bazy danych

Aplikacja używa dwóch poziomów izolacji:
- **Operacje zapisu** (`load_session`, rejestracja) – `READ COMMITTED` – chroni przed dirty reads
- **Operacje odczytu analitycznego** (porównania, eksport) – wyższy poziom izolacji – zapewnia spójność danych podczas złożonych zapytań

---

## Zmienne środowiskowe

| Zmienna | Opis | Przykład |
|---|---|---|
| `DATABASE_URL` | Connection string bazy danych | `sqlite:///./f1.db` |
| `SECRET_KEY` | Klucz do podpisywania tokenów JWT | `tajny_klucz_min_32_znaki` |
| `ALGORITHM` | Algorytm JWT | `HS256` |