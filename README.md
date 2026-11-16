# BlogApp – Full-Stack Blog Application

A full-stack Blog Application built using **Django REST Framework, PostgreSQL, React, and Tailwind CSS**. The application provides secure JWT authentication, role-based access control, and blog management functionality.

## Technologies Used

### Backend
- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- django-filter

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Toastify

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Access and refresh tokens
- Authenticated user profile
- Role-based access control

### User Roles

**ADMIN**
- Create blogs
- Update and delete blogs
- Publish and manage blogs
- View published and unpublished blogs

**USER**
- Register and log in
- View published blogs
- Search and filter blogs
- Read blog details

### Blog Management
- Complete blog CRUD operations
- Unique blog slugs
- Published and draft status
- Author information
- Search and filtering
- Pagination

## Project Structure

```text
BlogApp/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
│
├── server/
│   ├── blogs/
│   ├── config/
│   ├── users/
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/badalchand2026/Blog-App.git
cd Blog-App
```

### 2. Backend Setup

```bash
cd server
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory and configure your Django secret key and PostgreSQL database credentials according to `server/config/settings.py`.

Never upload your actual `.env` file to GitHub.

### 4. Run Database Migrations

```bash
python manage.py migrate
```

Create an administrator:

```bash
python manage.py createsuperuser
```

Start the backend:

```bash
python manage.py runserver
```

Backend URL: http://127.0.0.1:8000/

### 5. Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: http://localhost:5173/

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/refresh/` | Refresh JWT token |
| GET | `/api/auth/profile/` | Get user profile |

### Blogs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blogs/` | List blogs |
| POST | `/api/blogs/` | Create blog (ADMIN) |
| GET | `/api/blogs/{id}/` | Get blog details |
| PUT | `/api/blogs/{id}/` | Update blog (ADMIN) |
| PATCH | `/api/blogs/{id}/` | Partially update blog (ADMIN) |
| DELETE | `/api/blogs/{id}/` | Delete blog (ADMIN) |

## Testing

Run backend tests:

```bash
python manage.py test users
python manage.py test blogs
```

## Author

**Badal Chand**

GitHub: [@badalchand2026](https://github.com/badalchand2026)
