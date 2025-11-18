# Aplikace pro plánování údržby strojů a školení zaměstnanců
## Setting up working environment for Angular frontend
### Prerequisites
- Node.js (version 16 or higher) and npm installed. Download from [nodejs.org](https://nodejs.org/).
- Angular CLI installed globally: `npm install -g @angular/cli`.

### Setup Instructions
1. Navigate to the frontend directory:
    ```
    cd ./frontend/dmp-angular
    ```

2. Install dependencies:
    ```
    npm install
    ```

3. Start the development server:
    ```
    ng serve
    ```
    The application will be available at `http://localhost:4200`.

### Building for Use in Eel
To compile and build the application:
```
ng build
```
The output will be in the `./frontend/dist/browser` directory.