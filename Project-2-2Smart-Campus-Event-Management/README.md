# Project 2 — Smart Campus Event Management System

Spring Boot + Thymeleaf full-stack application to manage campus events, registrations and feedback.

Run
1. Configure database in `src/main/resources/application.properties` or via env vars `DB_USERNAME` and `DB_PASSWORD`.
2. Create MySQL database `smart_campus`.
3. Build and run:
```
mvn clean install
mvn spring-boot:run
```
Default server port is `8081`.

Sample accounts seeded by the application (DataInitializer):
- Admin: admin@campus.com / adminpass
- Student: john@campus.com / studentpass

APIs
- GET /api/events
- GET /api/events/{id}
- POST /api/events/{id}/register?userId={id}
- POST /api/feedback

Notes
- This implementation focuses on demonstrating Spring Core, MVC, Data JPA, Thymeleaf, Security, validation and exception handling.
