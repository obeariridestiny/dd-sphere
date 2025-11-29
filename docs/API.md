# DD Sphere API Documentation

## Base URL
- Production: `https://your-backend.onrender.com/api`
- Local: `http://localhost:5000/api`

## Authentication
Add header: `Authorization: Bearer your-jwt-token`

## Main Endpoints
- `POST /auth/register` - Create user
- `POST /auth/login` - Login user  
- `GET /posts` - Get all posts
- `POST /posts` - Create post (auth required)
- `POST /seo/analyze` - SEO analysis