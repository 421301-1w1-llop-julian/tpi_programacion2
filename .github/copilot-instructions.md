# AI Agent Instructions for TPI Programming Project

## Project Architecture

This is a full-stack web application with distinct frontend and backend components:

### Backend (.NET Core API)

-   Located in `backend/WebApplication1/`
-   ASP.NET Core Web API using .NET 8.0
-   Uses Swagger/OpenAPI for API documentation
-   Standard ASP.NET middleware pipeline with HTTPS redirection and authentication
-   Controller-based routing

### Frontend (Vanilla JavaScript)

-   Located in `frontend/`
-   Uses vanilla JavaScript with a modular approach
-   No build tools or transpilation required
-   Simple authentication state management
-   Direct DOM manipulation pattern

## Key Files and Directories

### Backend

-   `Program.cs`: Main application entry point and middleware configuration
-   `WebApplication1.csproj`: Project configuration and dependencies
-   `Controllers/`: API endpoints (to be implemented)

### Frontend

-   `index.html`: Main entry point with minimal structure
-   `js/index.js`: Main JavaScript module handling auth state and view switching
-   `js/authHome.js`: Authentication view component
-   `js/home.js`: Main application view component

## Development Workflow

### Backend Development

1. Open `TPI_API.sln` in Visual Studio or VS Code
2. Use built-in Swagger UI for API testing (available in development)
3. Implement new endpoints in `Controllers/` directory
4. Authentication is enabled but needs implementation

### Frontend Development

1. Serve frontend directory using a local web server
2. JavaScript modules use vanilla import/export
3. Auth state controls view switching between `authHome` and `home` components

## Project Conventions

### Frontend Patterns

-   Components are functions that return DOM elements
-   State changes trigger view re-renders
-   Use `document.createElement()` for DOM manipulation
-   Component files export a default function

### Backend Patterns

-   RESTful API design
-   Swagger documentation for all endpoints
-   Standard ASP.NET Core middleware configuration
-   Development/Production environment distinction

## Integration Points

-   Frontend expects backend API at configurable endpoint (to be implemented)
-   Authentication state managed in frontend with backend validation
-   API endpoints will use standard HTTP methods and JSON responses

## Known Limitations

-   No bundling or build process for frontend
-   Basic authentication without token persistence
-   Limited error handling implementation
