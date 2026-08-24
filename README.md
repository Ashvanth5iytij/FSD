# Full Stack Application Development Lab

## Course Information

**Course:** Full Stack Application Development
**Course Code:** 10211CS224
**Programme:** B.Tech – Computer Science and Engineering
**University:** Vel Tech University
**Lab:** Full Stack Application Development Laboratory

---

## About

This repository contains the laboratory exercises and project work completed as part of the Full Stack Application Development course.

The lab focuses on practical implementation of database systems, frontend web technologies, JavaScript, Spring Framework, Spring Boot, RESTful APIs, microservices, Git and GitHub, CI/CD, cloud computing, and Generative AI-assisted development.

The objective is to develop practical skills required to design, implement, test, version, and deploy modern full-stack applications.

---

## Technologies and Tools

* HTML5
* CSS3
* JavaScript
* ES6
* SQL
* MySQL / H2
* Spring Framework
* Spring Core
* Spring MVC
* Spring Boot
* Spring Data JPA
* REST APIs
* Spring Security
* React JS
* TypeScript
* Maven
* Git
* GitHub
* Jenkins
* GitHub Actions
* GitLab CI/CD
* AWS
* Google Cloud
* Microsoft Azure
* Generative AI
* Prompt Engineering

---

# Part A – Laboratory Tasks

## Task 1 – Student Registration & Data Storage

Design and implement a student registration form using HTML5 and CSS3.

### Requirements

* Student name
* Email
* Date of birth
* Department
* Phone number
* Store registration data in a database
* Retrieve stored records using SQL `SELECT`

### Concepts

* HTML5 Forms
* CSS3
* Form inputs
* SQL
* Database connectivity
* `SELECT` queries

---

## Task 2 – Data Retrieval & Sorting Dashboard

Create a dashboard to display student or employee records.

### Requirements

* Display database records
* Sort records by name
* Sort records by date
* Filter records by department
* Display the number of students in each department

### Concepts

* SQL sorting
* Filtering
* Aggregate functions
* `ORDER BY`
* `GROUP BY`
* Dynamic web pages

---

## Task 3 – Login System with Validation

Develop a login system that validates user credentials.

### Requirements

* Create a login page
* Validate input using JavaScript
* Verify credentials against the database
* Display dynamic error messages

### Concepts

* HTML forms
* JavaScript validation
* Database authentication
* DOM manipulation
* Dynamic error handling

---

## Task 4 – Order Management using Joins

Develop an order management system using relational database operations.

### Tables

* Customers
* Orders
* Products

### Requirements

* Display customer order history
* Use JOIN queries
* Find the highest-value order
* Find the most active customer
* Use subqueries

### Concepts

* SQL JOIN
* Subqueries
* `ORDER BY`
* Relational database design
* CSS layout

---

## Task 5 – Transaction-Based Payment Simulation

Simulate an online payment transaction.

### Requirements

1. Deduct the payment amount from the user's account.
2. Add the amount to the merchant account.
3. Commit the transaction when successful.
4. Roll back the transaction when an error occurs.

### Concepts

* Database transactions
* `COMMIT`
* `ROLLBACK`
* Transaction management
* Payment processing logic

---

## Task 6 – Automated Logging using Triggers & Views

Implement database-level activity tracking.

### Requirements

* Create a trigger to log every `INSERT`
* Create a trigger to log every `UPDATE`
* Create a view displaying daily activity reports

### Concepts

* SQL Triggers
* SQL Views
* Audit logging
* Database automation

---

## Task 7 – Interactive Web Form with Events & Functions

Create an interactive feedback form using JavaScript.

### Requirements

* Validate inputs during keypress events
* Highlight fields when the mouse hovers over them
* Display confirmation on double-clicking the submit button
* Implement reusable JavaScript validation functions

### Concepts

* JavaScript functions
* Event handling
* Keyboard events
* Mouse events
* DOM manipulation
* Form validation

---

## Task 8 – Spring Core Employee Management

Create a simple Employee Management module using Spring Core.

### Requirements

* Implement Inversion of Control
* Implement Dependency Injection
* Use `@Component`
* Use `@Autowired`
* Use `BeanFactory`
* Store employee information in memory

### Concepts

* Spring Core
* IoC
* Dependency Injection
* Beans
* Annotation-based configuration

---

## Task 9 – Spring MVC Application

Develop a basic Spring MVC application using annotation-based configuration.

### Requirements

* Create a controller
* Accept user requests
* Process requests through the MVC architecture
* Display employee information
* Avoid XML-based configuration

### Concepts

* Spring MVC
* Controllers
* `@Controller`
* Request mapping
* Model-View-Controller architecture

---

## Task 10 – Student CRUD Application using Spring Boot

Build a Student CRUD application using Spring Boot.

### Requirements

Implement:

* Create
* Read
* Update
* Delete

### Database Mapping

Use JPA annotations including:

* `@Entity`
* `@Id`
* `@Table`
* `@Column`

### Concepts

* Spring Boot
* JPA
* ORM
* CRUD
* Relational databases

---

## Task 11 – Spring Data JPA Data Access Layer

Implement a data access layer using Spring Data JPA.

### Requirements

* Use `JpaRepository`
* Create custom query methods
* Search students by department
* Search students by age
* Implement sorting
* Implement pagination

### Concepts

* Spring Data JPA
* Repository pattern
* Custom queries
* Sorting
* Pagination

---

## Task 12 – Product Management REST API

Develop a RESTful Product Management API using Spring Boot.

### HTTP Methods

* `GET`
* `POST`
* `PUT`
* `DELETE`

### Requirements

* Implement product CRUD operations
* Return JSON responses
* Test APIs using a REST client

### Concepts

* REST architecture
* Spring Boot
* `@RestController`
* HTTP methods
* JSON
* API testing

---

## Task 13 – Exception Handling & Validation

Enhance the REST API with proper validation and exception handling.

### Requirements

* Implement global exception handling
* Validate API input
* Use validation annotations
* Return meaningful error responses

### Concepts

* Input validation
* Exception handling
* Global exception handlers
* REST error responses

---

## Task 14 – Microservices Architecture

Convert a monolithic application into a microservices-based system.

### Requirements

* Create at least two independent services
* Apply loose coupling
* Follow the Single Responsibility Principle
* Allow independent deployment

### Concepts

* Microservices
* Service independence
* Loose coupling
* Single responsibility
* Distributed architecture

---

## Task 15 – Service Registry & Discovery

Implement service registration and discovery using a tool such as Eureka.

### Requirements

* Register multiple microservices
* Implement service discovery
* Dynamically locate services
* Avoid hard-coded service URLs

### Concepts

* Service Registry
* Service Discovery
* Eureka
* Dynamic service lookup

---

## Task 16 – API Gateway & Load Balancing

Configure an API Gateway for a microservices application.

### Requirements

* Route client requests to appropriate services
* Configure API Gateway
* Implement basic load balancing
* Distribute requests between service instances

### Concepts

* API Gateway
* Request routing
* Load balancing
* Microservices communication

---

## Task 17 – Inter-Service Communication

Implement communication between independent microservices.

### Requirements

* Create a service that consumes another service's REST API
* Handle API responses
* Handle communication failures gracefully

### Concepts

* REST communication
* Service-to-service communication
* HTTP requests
* Failure handling

---

## Task 18 – Unit Testing for Microservices

Create unit tests for microservice components.

### Requirements

Test:

* Service logic
* REST controllers
* Data handling

### Concepts

* Unit testing
* Test-driven development principles
* REST controller testing
* Service-layer testing
* Reliability

---

## Task 19 – Git Repository & Version Control

Create and manage a Git repository for a sample application.

### Requirements

* Initialize a repository
* Stage files
* Commit changes
* Maintain version history
* Create a GitHub repository
* Push the project
* Manage remote repositories

### Concepts

* Git
* GitHub
* Repository management
* Commits
* Remote repositories
* Version control

---

## Task 20 – Git Branching, Merging & Rebasing

Implement Git branching strategies.

### Requirements

* Create feature branches
* Make changes on branches
* Merge branches
* Perform rebasing
* Intentionally create merge conflicts
* Resolve merge conflicts

### Concepts

* Branching
* Merging
* Rebasing
* Conflict resolution
* Collaborative development

---

## Task 21 – CI/CD Pipeline

Implement a CI/CD pipeline using one of the following:

* Jenkins
* GitHub Actions
* GitLab CI/CD

### Requirements

Automate:

1. Code checkout
2. Build
3. Testing
4. Deployment

### Concepts

* Continuous Integration
* Continuous Deployment
* Build automation
* Automated testing
* Deployment pipelines

---

## Task 22 – Cloud Service Provider Comparison

Explore major cloud service providers.

### Platforms

* AWS
* Google Cloud
* Microsoft Azure

### Compare

* Compute services
* Storage services
* Database services
* Networking services
* Pay-as-you-use pricing model

### Concepts

* Cloud computing
* IaaS
* PaaS
* SaaS
* Cloud pricing
* Cloud architecture

---

## Task 23 – Vibe Coding & Prompt Engineering

Use a Generative AI tool to assist in software development.

### Requirements

* Design effective prompts
* Generate code snippets
* Generate cloud configuration templates
* Generate application logic
* Evaluate generated outputs
* Assess accuracy and efficiency

### Concepts

* Generative AI
* Vibe Coding
* Prompt Engineering
* Prompt refinement
* AI-assisted software development

---

## Task 24 – Cloud-Based Feature using Vibe Coding

Build a complete cloud-based feature using Generative AI.

### Requirements

* Generate a REST API using iterative prompts
* Generate cloud deployment instructions
* Generate security configurations
* Refine prompts based on generated results
* Maintain different prompt versions
* Evaluate the generated implementation

### Evaluation Criteria

* Code accuracy
* Scalability
* Security
* Prompt effectiveness
* Real-world usability

---

# Part B – Projects

## Project 1 – Internal Department Event Ticket Booking System

Develop a React JS-based web application for booking tickets for an internal department event such as a technical fest or seminar.

### Event Details Module

Display:

* Event name
* Department name
* Event date and time
* Venue
* Ticket price
* Available tickets

### Ticket Booking Module

Allow users to enter:

* Name
* Email ID
* Department
* Number of tickets

### Booking Requirements

* All fields must be mandatory
* Validate email format
* Ticket quantity must be positive
* Prevent booking more tickets than available
* Display appropriate validation messages
* Display booking confirmation

### Booking Summary

Display:

* User name
* Event name
* Number of tickets booked
* Total amount

### React Concepts

* Functional Components
* JSX
* `useState`
* Event Handling
* Conditional Rendering

### Optional Features

* Reset booking form
* CSS styling
* Separate Event Details component
* Separate Booking Form component

---

# Project 2 – Smart Campus Event Management System

Develop a full-stack web application for managing college or university events, workshops, and seminars.

The system should allow students to browse and register for events while administrators manage the event catalogue.

### Student Features

* Browse upcoming events
* View event information
* Register for events
* Validate registration forms
* View registered events
* Provide feedback

### Admin Features

* Add events
* Edit events
* Delete events
* Search events
* Filter events by date
* Filter by department
* Filter by event type
* View registration statistics

### Technical Stack

#### Backend

* Spring Core
* Spring MVC
* Spring Boot
* Spring Data JPA
* REST APIs

#### Frontend

* HTML5
* CSS3
* Thymeleaf

#### Database

* Relational database
* JPA entity mapping

#### Security

* Basic authentication
* Admin login

#### Validation

* `@NotNull`
* `@Size`

#### Exception Handling

* Global exception handling
* `@ControllerAdvice`

---

# Project 3 – Job Portal Management System

Develop a full-stack job portal connecting job seekers and employers.

The application allows students to create profiles, upload resumes, search for jobs, and apply for available positions.

## Job Seeker Features

* Register
* Login
* Create profile
* Maintain profile
* Upload resume
* Search jobs
* Filter jobs
* Apply for jobs
* Track application status
* Receive shortlisted-job notifications

## Employer Features

* Post jobs
* Edit jobs
* Delete jobs
* View applicants
* Shortlist applicants
* Reject applications

## Job Information

A job can contain:

* Job title
* Description
* Required skills
* Salary
* Category
* Location
* Experience requirements

## Backend

Use:

* Spring Boot
* Spring MVC
* REST APIs
* `@RestController`
* `@Controller`
* Spring Data JPA
* Spring Security

## Database Entities

* User
* Job
* Application

## Relationships

* Employer → Jobs: One-to-Many
* Application → Job: Many-to-One
* Application → User: Many-to-One

## Database Operations

Implement:

* CRUD operations
* Custom finder methods
* Sorting
* Filtering

## Security

Implement:

* Student role
* Employer role
* Admin role
* Role-based access
* Password hashing
* Login authentication

## Frontend

Use:

* HTML5
* CSS3
* Thymeleaf
* JavaScript
* ES6
* Responsive forms
* Dashboards
* Dynamic table filtering

## Optional Add-ons

* Resume file uploads using `MultipartFile`
* Email notifications
* Application analytics dashboard
* Shortlisted candidate statistics

---

# Learning Outcomes

After completing the laboratory, students should be able to:

* Develop dynamic web applications using HTML, CSS, JavaScript, and React.
* Work with relational databases and SQL queries.
* Build backend applications using Spring Boot.
* Develop RESTful APIs.
* Implement CRUD operations using Spring Data JPA.
* Apply validation and exception handling.
* Design applications using microservices architecture.
* Implement service discovery, API gateways, and inter-service communication.
* Use Git and GitHub for source-code management.
* Implement CI/CD workflows.
* Understand fundamental cloud computing services and deployment models.
* Apply Generative AI and prompt engineering to software development.
* Develop complete full-stack applications combining frontend, backend, and database technologies.

---

# Course Coverage

| Area                        | Tasks               |
| --------------------------- | ------------------- |
| Database & SQL              | 1–6                 |
| HTML, CSS & JavaScript      | 1–7                 |
| Spring Core                 | 8                   |
| Spring MVC                  | 9                   |
| Spring Boot & JPA           | 10–13               |
| Microservices               | 14–18               |
| Git & GitHub                | 19–20               |
| CI/CD                       | 21                  |
| Cloud Computing             | 22                  |
| Generative AI & Vibe Coding | 23–24               |
| React JS                    | Part-B Project 1    |
| Full-Stack Development      | Part-B Projects 2–3 |

---

# References

The official course syllabus lists resources including W3Schools, Spring documentation, AWS, Google Cloud, Microsoft Azure, StackBlitz, Vercel, and GitHub.

* W3Schools
* Spring Documentation
* AWS Documentation
* Google Cloud Documentation
* Microsoft Azure Documentation
* GitHub Documentation
* StackBlitz
* Vercel

---

# Academic Information

This repository is maintained as a record of laboratory exercises and project implementations completed for the Full Stack Application Development course under the B.Tech Computer Science and Engineering curriculum.

The laboratory work follows the prescribed experiments and projects specified in the Vel Tech University course syllabus.
=======
# FSD Laboratory Tasks 1-7

This project implements seven lab tasks using Node.js, Express, MySQL, and vanilla frontend.

Prerequisites:
- Node.js
- MySQL server

Setup:
1. Create the database and tables: run `database/schema.sql` in MySQL.
2. Load sample data: run `database/seed.sql`.
3. Create triggers and views: run `database/triggers.sql` and `database/views.sql`.
4. Copy `.env.example` to `.env` and fill values.
5. Install dependencies: `npm install`.
6. Start server: `npm start`.

Frontend pages:
- Task 1: frontend/task1/index.html
- Task 2: frontend/task2/index.html
- Task 3: frontend/task3/index.html
- Task 4: frontend/task4/index.html
- Task 5: frontend/task5/index.html
- Task 6: frontend/task6/index.html
- Task 7: frontend/task7/index.html

API endpoints:
- POST /api/students
- GET /api/students
- GET /api/students/stats/departments
- POST /api/login
- GET /api/orders
- GET /api/orders/stats/top-order
- GET /api/orders/stats/top-customer
- POST /api/payment
- GET /api/payment/accounts
- GET /api/audit/daily
>>>>>>> 3a2b7dc (Add FSD lab tasks and Project-1 and Project-2)
