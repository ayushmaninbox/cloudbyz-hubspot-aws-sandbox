# HubSpot vs AWS Blog Sandboxes Sandbox

A sandbox containing two separate blog portals designed to compare HubSpot CMS's native hosting model with GoDaddy + AWS Lambda integration layouts. Both portals have identical UI designs but use entirely separate data fetching and rendering models.

---

## Directory Structure

```
blogs-fix/
├── .env                  # HubSpot credentials (loaded by both servers)
├── .gitignore            # Ignores credentials/dependencies
├── README.md             # Developer instructions
├── index.php             # Root landing page (Sandbox Navigation)
├── hubspot/              # HubSpot Simulation (SSR)
│   ├── index.php         # Server-Side Rendered PHP (fetches from port 3000)
│   ├── style.css         # Stylesheet copy
│   └── hubspot.js        # HubSpot SSR API server running on port 3000
└── aws/                  # AWS Simulation (AJAX Client-Side Fetch)
    ├── index.php         # Client-Side AJAX Fetch (fetches from port 3001)
    ├── style.css         # Stylesheet copy
    └── aws.js            # AWS Lambda API server running on port 3001
```

---

## Sandbox Environments

### 1. HubSpot Portal (`/hubspot/`)
- **Simulation**: Replicates the native HubSpot CMS hosting architecture.
- **Rendering Model**: **Server-Side Rendering (SSR)**. Blog content is retrieved from the HubSpot API server (`hubspot.js` on port `3000`) and compiled into static HTML cards on the server.
- **Data Filter**: Automatically excludes AWS-specific blogs (Blog 11-66) to only show corporate blogs (Blog 1-6).
- **Behavior**: Clicking tabs filters content and triggers a page reload (`?section=X`). **Zero client-side Fetch/XHR calls are logged in DevTools**.

### 2. AWS Portal (`/aws/`)
- **Simulation**: Replicates a GoDaddy-hosted landing page integrated with an AWS Lambda backend.
- **Rendering Model**: **Client-Side Rendering (AJAX Fetch)**. The browser loads an empty layout skeleton, displays a loading spinner, fetches data asynchronously via JavaScript `fetch`/`$.ajax` from the AWS API server (`aws.js` on port `3001`), and compiles the cards directly into the DOM.
- **Data Filter**: Filters to return ONLY AWS-specific blogs (Blog 11-66).
- **Behavior**: Clicking tabs filters content instantly **without reloading the page**, while browser DevTools network tab logs the calls.

---

## Running the Sandbox

### 1. Start the API Backend Servers
Run both local backend Node servers:
- **HubSpot SSR Server (port 3000)**:
  ```bash
  node hubspot/hubspot.js
  ```
- **AWS AJAX Server (port 3001)**:
  ```bash
  node aws/aws.js
  ```

### 2. Start the PHP Server
Start the PHP server in the root directory:
```bash
php -S localhost:8000
```

### 3. Open the Sandbox Hub
Open your browser and navigate to:
**[http://localhost:8000/](http://localhost:8000/)**
