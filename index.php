<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <title>Cloudbyz Blog Portals Sandbox</title>
  <!-- Bootstrap 4.5.2 -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
  <!-- Google Fonts -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Inter:wght@400;500;600&display=swap" />
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <style>
    :root {
      --bg-primary: #f8fafc;
      --bg-surface: #ffffff;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --color-hubspot: #ea580c;
      --color-aws: #2563eb;
      --border-light: #e2e8f0;
    }
    
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    
    .sandbox-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
      max-width: 960px;
      width: 100%;
    }
    
    .portal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      padding: 30px;
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }
    
    .portal-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px rgba(0, 0, 0, 0.05);
    }
    
    .portal-card.hubspot-card {
      border-top: 4px solid var(--color-hubspot);
    }
    
    .portal-card.aws-card {
      border-top: 4px solid var(--color-aws);
    }
    
    .portal-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 1.4rem;
      margin-bottom: 8px;
    }
    
    .portal-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 20px;
    }
    
    .badge-hubspot {
      background-color: #fff7ed;
      color: #c2410c;
    }
    
    .badge-aws {
      background-color: #eff6ff;
      color: #1d4ed8;
    }
    
    .portal-description {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 30px;
      flex-grow: 1;
    }
    
    .btn-portal {
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      border-radius: 8px;
      padding: 12px 24px;
      text-align: center;
      transition: all 0.2s ease;
      text-decoration: none !important;
      display: block;
      margin-top: auto;
    }
    
    .btn-hubspot {
      background-color: var(--color-hubspot);
      color: #ffffff !important;
    }
    
    .btn-hubspot:hover {
      background-color: #c2410c;
    }
    
    .btn-aws {
      background-color: var(--color-aws);
      color: #ffffff !important;
    }
    
    .btn-aws:hover {
      background-color: #1d4ed8;
    }
  </style>
</head>
<body>

  <div class="sandbox-card">
    <div class="text-center mb-5">
      <h1 class="font-weight-bold" style="font-family: 'Poppins', sans-serif; font-size: 2.2rem;">
        <span class="text-primary"><i class="fas fa-layer-group mr-2"></i></span>Cloudbyz Blog Sandboxes
      </h1>
      <p class="text-muted">Choose a sandbox portal below to inspect environment architectures and network payloads.</p>
    </div>
    
    <div class="row">
      <!-- HubSpot SSR Portal -->
      <div class="col-md-6 mb-4 mb-md-0">
        <div class="portal-card hubspot-card">
          <span class="portal-badge badge-hubspot">Server-Side Rendered (SSR)</span>
          <h2 class="portal-title">HubSpot Portal</h2>
          <p class="text-muted small mb-3">Replicates HubSpot CMS native hosting model</p>
          <p class="portal-description">
            All blog content is fetched from the HubSpot CMS API and pre-compiled into static HTML on the server. Navigating tabs reloads the page. The browser DevTools network panel shows <strong>zero client-side XHR/Fetch blog retrieval calls</strong>.
          </p>
          <a href="./hubspot/" class="btn-portal btn-hubspot">
            Open HubSpot Portal (SSR) <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
      
      <!-- GoDaddy/AWS AJAX Portal -->
      <div class="col-md-6">
        <div class="portal-card aws-card">
          <span class="portal-badge badge-aws">Client-Side AJAX Fetch</span>
          <h2 class="portal-title">AWS Portal</h2>
          <p class="text-muted small mb-3">Replicates GoDaddy + AWS Lambda integration model</p>
          <p class="portal-description">
            The frontend serves a blank layout skeleton. Once loaded, client-side JavaScript calls the API asynchronously, triggers a loading spinner, and renders cards in the DOM. Switching tabs filters blogs instantly <strong>without reloading the page</strong> while logging requests.
          </p>
          <a href="./aws/" class="btn-portal btn-aws">
            Open AWS Portal (AJAX) <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
