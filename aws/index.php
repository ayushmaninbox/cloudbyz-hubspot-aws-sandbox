<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <title>Blog Filtering Demo (AJAX)</title>
  <!-- Bootstrap 4.5.2 -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
  <!-- Google Fonts -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Inter:wght@400;500&display=swap" />
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
  <!-- Minimal White Theme CSS -->
  <link rel="stylesheet" href="./style.css" />
</head>
<body>

  <!-- Navigation Bar -->
  <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3">
    <div class="container">
      <a class="navbar-brand font-weight-bold text-dark" href="../" style="font-family: 'Poppins', sans-serif; font-size: 1.3rem;">
        <span class="text-primary"><i class="fas fa-layer-group mr-2"></i></span>BlogPortal (AWS Client-Side AJAX)
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <button class="nav-link tab-btn active" data-section="" data-tag="" data-title="All Resources">All</button>
          </li>
          <li class="nav-item">
            <button class="nav-link tab-btn" data-section="1" data-tag="Cosmetics" data-title="Section 1 (Cosmetics)">Section 1</button>
          </li>
          <li class="nav-item">
            <button class="nav-link tab-btn" data-section="2" data-tag="Biotechnology" data-title="Section 2 (Biotechnology)">Section 2</button>
          </li>
          <li class="nav-item">
            <button class="nav-link tab-btn" data-section="3" data-tag="Animal Health" data-title="Section 3 (Animal Health)">Section 3</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Page Content Container -->
  <div class="container my-5">
    <div class="mb-4">
      <h1 class="font-weight-bold" id="page-title" style="font-family: 'Poppins', sans-serif;">All Resources</h1>
      <p class="text-muted">HubSpot blogs fetched entirely on the client-side (AJAX) from the Node.js API server.</p>
    </div>

    <!-- Loading Spinner State -->
    <div id="loading" class="loading-state py-5">
      <div class="spinner"></div>
      <p class="text-muted mt-2">Loading blogs...</p>
    </div>

    <!-- Error State -->
    <div id="error-alert" class="alert alert-danger d-none w-100 py-3">
      <i class="fas fa-exclamation-triangle mr-2"></i> <span id="error-msg">Error retrieving posts.</span>
    </div>

    <!-- Empty State -->
    <div id="empty-state" class="empty-state w-100">
      <i class="fas fa-exclamation-circle text-muted mb-3" style="font-size: 2rem;"></i>
      <h3>No Blogs Found</h3>
      <p>Ensure that server.js is running on port 3000 and that blogs exist on your HubSpot portal.</p>
    </div>

    <!-- Blog Grid -->
    <main class="blog-grid" id="blog-grid"></main>
  </div>

  <!-- Scripts -->
  <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

  <!-- Client-side Fetch Logic -->
  <script>
    $(document).ready(function() {
      const apiBaseUrl = 'http://localhost:3001/api/blogs';
      
      // Load blogs on start
      loadBlogs('', 'All Resources');

      // Tab click events
      $('.tab-btn').click(function(e) {
        e.preventDefault();
        
        // Update active class
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');

        // Get filter settings
        const tag = $(this).data('tag');
        const title = $(this).data('title');

        // Fetch
        loadBlogs(tag, title);
      });

      function loadBlogs(tag, title) {
        // Update page title
        $('#page-title').text(title);

        // Reset display states
        $('#blog-grid').empty().hide();
        $('#error-alert').addClass('d-none');
        $('#empty-state').hide();
        $('#loading').show();

        // AJAX Request
        const url = `${apiBaseUrl}?tag=${encodeURIComponent(tag)}&limit=100`;
        
        $.ajax({
          url: url,
          type: 'GET',
          dataType: 'json',
          success: function(response) {
            $('#loading').hide();
            
            if (response.success && response.data && response.data.posts) {
              const posts = response.data.posts;
              
              if (posts.length === 0) {
                $('#empty-state').show();
                return;
              }

              // Render cards
              posts.forEach(function(post) {
                // Publish date formatting
                const dateObj = new Date(post.publishDate);
                const options = { month: 'short', day: '2-digit', year: 'numeric' };
                const dateStr = dateObj.toLocaleDateString('en-US', options);

                // Excerpt truncation
                const maxLen = 120;
                let excerpt = post.postBody || '';
                if (excerpt.length > maxLen) {
                  excerpt = excerpt.substring(0, maxLen) + '...';
                }

                // Tags HTML
                let tagsHtml = '';
                if (post.tags && Array.isArray(post.tags)) {
                  post.tags.forEach(function(t) {
                    if (!t) return;
                    let cls = 'tag-default';
                    const lowerTag = t.toLowerCase();
                    if (lowerTag === 'cosmetics') cls = 'tag-cosmetics';
                    else if (lowerTag === 'biotechnology') cls = 'tag-biotechnology';
                    else if (lowerTag === 'animal health') cls = 'tag-animal-health';
                    
                    tagsHtml += `<span class="tag-badge ${cls}">${t}</span>`;
                  });
                }

                // Card Template
                const cardHtml = `
                  <article class="blog-card">
                    <div class="blog-img-container">
                      <img src="${post.featuredImage}" class="blog-img" alt="${post.name}" />
                      <div class="blog-tags">
                        ${tagsHtml}
                      </div>
                    </div>
                    <div class="blog-content">
                      <h3 class="blog-card-title">${post.name}</h3>
                      <p class="blog-card-excerpt">${excerpt}</p>
                      <div class="blog-footer">
                        <img src="${post.blogAuthor.avatar}" class="author-avatar" alt="${post.blogAuthor.fullName}" />
                        <div class="author-meta">
                          <span class="author-name">${post.blogAuthor.fullName}</span>
                          <span class="post-date">${dateStr}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                `;
                
                $('#blog-grid').append(cardHtml);
              });
              
              $('#blog-grid').fadeIn(200);

            } else {
              showError(response.error || 'Invalid API response format.');
            }
          },
          error: function(xhr, status, error) {
            $('#loading').hide();
            showError('Could not connect to JS API backend server (port 3000). Please ensure server.js is running.');
          }
        });
      }

      function showError(msg) {
        $('#error-msg').text(msg);
        $('#error-alert').removeClass('d-none');
      }
    });
  </script>
</body>
</html>
