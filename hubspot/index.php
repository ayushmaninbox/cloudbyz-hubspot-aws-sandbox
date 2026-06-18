<?php
// Determine active industry
$industry = isset($_GET['industry']) ? $_GET['industry'] : '';
$sectionTitle = 'All Resources';

if ($industry === 'cosmetics') {
    $sectionTitle = 'Cosmetics';
} elseif ($industry === 'biotechnology') {
    $sectionTitle = 'Biotechnology';
} elseif ($industry === 'animal-health') {
    $sectionTitle = 'Animal Health';
}

// Fetch posts from Node.js server (running on port 3000) during page compile
$backendUrl = 'http://localhost:3000/api/blogs?industry=' . urlencode($industry) . '&limit=100';
$posts = [];
$error = '';

$responseJson = @file_get_contents($backendUrl);
if ($responseJson === false) {
    $error = 'Could not connect to JS API backend server (port 3000). Please ensure server.js is running.';
} else {
    $response = json_decode($responseJson, true);
    if (isset($response['success']) && $response['success']) {
        $posts = isset($response['data']['posts']) ? $response['data']['posts'] : [];
    } else {
        $error = isset($response['error']) ? $response['error'] : 'Error retrieving posts.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <title>Blog Filtering Demo (SSR)</title>
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
        <span class="text-primary"><i class="fas fa-layer-group mr-2"></i></span>BlogPortal (HubSpot SSR)
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <a class="nav-link tab-btn <?php echo $industry === '' ? 'active' : ''; ?>" href="index.php">All</a>
          </li>
          <li class="nav-item">
            <a class="nav-link tab-btn <?php echo $industry === 'cosmetics' ? 'active' : ''; ?>" href="index.php?industry=cosmetics">Cosmetics</a>
          </li>
          <li class="nav-item">
            <a class="nav-link tab-btn <?php echo $industry === 'biotechnology' ? 'active' : ''; ?>" href="index.php?industry=biotechnology">Biotechnology</a>
          </li>
          <li class="nav-item">
            <a class="nav-link tab-btn <?php echo $industry === 'animal-health' ? 'active' : ''; ?>" href="index.php?industry=animal-health">Animal Health</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Page Content Container -->
  <div class="container my-5">
    <div class="mb-4">
      <h1 class="font-weight-bold" style="font-family: 'Poppins', sans-serif;"><?php echo htmlspecialchars($sectionTitle); ?></h1>
      <p class="text-muted">HubSpot blogs compiled entirely on the server-side (PHP) via the JS backend.</p>
    </div>

    <!-- Blog Grid -->
    <main class="blog-grid" id="blog-grid">
      <?php if (!empty($error)): ?>
        <!-- Error State -->
        <div class="alert alert-danger w-100 py-3">
          <i class="fas fa-exclamation-triangle mr-2"></i> <?php echo htmlspecialchars($error); ?>
        </div>
      <?php elseif (empty($posts)): ?>
        <!-- Empty State / Setup Required -->
        <div class="empty-state d-block w-100">
          <i class="fas fa-exclamation-circle text-muted mb-3" style="font-size: 2rem;"></i>
          <h3>No Blogs Found</h3>
          <p>Please ensure your `.env` contains the correct HUBSPOT_TOKEN and HUBSPOT_BLOG_ID.</p>
        </div>
      <?php else: ?>
        <!-- Render Blog Cards -->
        <?php foreach ($posts as $post): ?>
          <?php
            // Format publish date
            $dateStr = date('M d, Y', strtotime($post['publishDate']));
            // Create body excerpt
            $excerpt = mb_strimwidth($post['postBody'], 0, 120, '...');
          ?>
          <article class="blog-card">
            <div class="blog-img-container">
              <img src="<?php echo htmlspecialchars($post['featuredImage']); ?>" class="blog-img" alt="<?php echo htmlspecialchars($post['name']); ?>" />
              <div class="blog-tags">
                <?php if (isset($post['tags']) && is_array($post['tags'])): ?>
                  <?php foreach ($post['tags'] as $t): ?>
                    <?php
                      $cls = 'tag-default';
                      $lt = strtolower($t);
                      if ($lt === 'cosmetics') $cls = 'tag-cosmetics';
                      elseif ($lt === 'biotechnology') $cls = 'tag-biotechnology';
                      elseif ($lt === 'animal health' || $lt === 'animal-health') $cls = 'tag-animal-health';
                      elseif ($lt === 'whitepaper' || $lt === 'whitepapers') $cls = 'tag-whitepaper';
                      elseif ($lt === 'case study' || $lt === 'case studies' || $lt === 'case-study') $cls = 'tag-case-study';
                      elseif ($lt === 'video' || $lt === 'videos') $cls = 'tag-video';
                    ?>
                    <span class="tag-badge <?php echo $cls; ?>"><?php echo htmlspecialchars($t); ?></span>
                  <?php endforeach; ?>
                <?php endif; ?>
              </div>
            </div>
            <div class="blog-content">
              <h3 class="blog-card-title"><?php echo htmlspecialchars($post['name']); ?></h3>
              <p class="blog-card-excerpt"><?php echo htmlspecialchars($excerpt); ?></p>
              <div class="blog-footer">
                <img src="<?php echo htmlspecialchars($post['blogAuthor']['avatar']); ?>" class="author-avatar" alt="<?php echo htmlspecialchars($post['blogAuthor']['fullName']); ?>" />
                <div class="author-meta">
                  <span class="author-name"><?php echo htmlspecialchars($post['blogAuthor']['fullName']); ?></span>
                  <span class="post-date"><?php echo htmlspecialchars($dateStr); ?></span>
                </div>
              </div>
            </div>
          </article>
        <?php endforeach; ?>
      <?php endif; ?>
    </main>
  </div>

  <!-- Scripts -->
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
