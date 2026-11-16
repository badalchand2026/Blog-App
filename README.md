# Django Blog Application

A backend-focused Blog Application built using Django REST Framework and PostgreSQL. The application provides JWT authentication, role-based access control, and blog management functionality.

## Technologies Used

- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- django-filter

## Features

### Authentication
- User registration
- JWT-based login
- Access and refresh tokens
- Token refresh
- Authenticated user profile
- Role-based permissions

### User Roles

**ADMIN**
- Create blogs
- Update blogs
- Delete blogs
- Publish and manage blogs
- View published and unpublished blogs

**USER**
- Register and log in
- View published blogs
- Search and filter blogs
- Access their authenticated profile

### Blog Management
- Create, read, update, and delete blogs
- Unique blog slugs
- Publish and draft status
- Author information
- Creation and update timestamps
- Pagination
- Search and filtering

## Project Structure

```text
DjangoBlog/
├── blogs/
│   ├── migrations/
│   ├── admin.py
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── config/
│   ├── settings.py
│   └── urls.py
├── users/
│   ├── migrations/
│   ├── models.py
│   ├── permissions.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── .gitignore
├── manage.py
└── requirements.txt
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/badalchand2026/Blog-App.git
cd Blog-App
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root.

Configure your Django secret key and PostgreSQL database credentials according to the settings in `config/settings.py`.

Do not upload your `.env` file to GitHub.

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create an admin account

```bash
python manage.py createsuperuser
```

### 7. Start the development server

```bash
python manage.py runserver
```

The application will run at:

`http://127.0.0.1:8000/`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a user |
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/refresh/` | Refresh JWT token |
| GET | `/api/auth/profile/` | Get authenticated profile |
| GET | `/api/auth/admin-test/` | Test admin access |

### Blogs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blogs/` | List blogs |
| POST | `/api/blogs/` | Create a blog (ADMIN) |
| GET | `/api/blogs/{id}/` | Get blog details |
| PUT | `/api/blogs/{id}/` | Update a blog (ADMIN) |
| PATCH | `/api/blogs/{id}/` | Partially update a blog (ADMIN) |
| DELETE | `/api/blogs/{id}/` | Delete a blog (ADMIN) |

### Search, Filtering and Pagination

```text
/api/blogs/?page=2
/api/blogs/?search=Django
/api/blogs/?is_published=true
```

## Testing

Run authentication tests:

```bash
python manage.py test users
```

Run blog tests:

```bash
python manage.py test blogs
```

## Security

- Passwords are securely hashed.
- JWT authentication protects private endpoints.
- Role-based permissions restrict admin operations.
- Public registration does not allow users to assign themselves the ADMIN role.
- Environment variables and secrets are excluded from version control.

## Author

**Badal Chand**

GitHub: [badalchand2026](https://github.com/badalchand2026)