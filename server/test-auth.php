### Learner Signup
POST http://192.168.2.161:5500/api/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "yourPassword123",
  "fullName": "Test User"
}

### Learner Login
POST http://192.168.2.161:5500/api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "yourPassword123"
}

### Protected Route (Example)
GET http://192.168.2.161:5500/api/protected
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
