# HubSpot SSR Blog Filtering Prototype

A premium, server-side rendered (SSR) blog filtering prototype designed to fetch, filter, and display posts from the HubSpot CMS. It replicates the native rendering model of HubSpot's CMS hosting to ensure high performance and maximum search engine indexability (SEO).

## Architecture Overview

The application utilizes a split SSR model:
1. **PHP Frontend (`index.php`)**: Dynamically compiles and serves the HTML view on the server. Navigating categories reloads the page with query variables (e.g., `index.php?section=3`), making the initial page load immediate and indexable by search engine crawlers with **zero AJAX/XHR fetch requests logged in DevTools**.
2. **Node.js Backend (`server.js`)**: A zero-dependency JavaScript API service running locally (on port `3000`) that securely reads HubSpot integration credentials, queries the HubSpot CMS API, maps tag IDs to their actual names, and serves formatted JSON payloads to the frontend.

```
+------------------+                   +------------------+                   +--------------------+
|   Web Browser    | --(Page Load)-->  |   PHP Frontend   | --(Internal API)-->|  Node.js API Srv  |
| (DevTools Clean) | <-- (HTML Grid) --|   (index.php)    | <--- (JSON Data) --|    (server.js)     |
+------------------+                   +------------------+                   +--------------------+
                                                                                        |
                                                                                (Secure HTTPS Req)
                                                                                        v
                                                                              +--------------------+
                                                                              |   HubSpot CMS API  |
                                                                              +--------------------+
```

---

## Features

- **HubSpot V3 Integration**: Programmatically queries live posts and tags using HubSpot's V3 CMS endpoints.
- **Dynamic Tag Mapping**: Automatically maps HubSpot tag IDs to their respective category labels (`Animal Health`, `Biotechnology`, `Cosmetics`) on the "All" tab.
- **Aesthetic Cards Layout**: Grid-based responsive design styled with a clean minimal theme and modern fonts (Inter & Poppins).
- **SEO & Performance optimized**: Zero client-side JS hydration needed to load blogs.

---

## Configuration

Credentials are loaded securely from a `.env` file in the root directory.

Create a file named `.env` in the root folder with the following structure:
```ini
HUBSPOT_TOKEN=your_hubspot_access_token_here
HUBSPOT_BLOG_ID=your_hubspot_blog_id_here
```

---

## How to Run

### 1. Start the Node.js API Backend
Run the background Node service:
```bash
node server.js
```
The API server will run at `http://localhost:3000`.

### 2. Start the PHP Frontend Server
Start a local PHP development server:
```bash
php -S localhost:8000
```

### 3. View the Prototype
Open your web browser and navigate to:
**[http://localhost:8000](http://localhost:8000)**
