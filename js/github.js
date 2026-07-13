// DYNAMIC GITHUB INTEGRATION WITH RECENT REPOS AND LOADERS
document.addEventListener('DOMContentLoaded', () => {
  const username = 'saurav827';
  
  // DOM Elements
  const followersCountEl = document.getElementById('github-followers');
  const reposCountEl = document.getElementById('github-repos');
  const totalGistsEl = document.getElementById('github-gists');
  const avatarEl = document.getElementById('github-avatar');
  const profileNameEl = document.getElementById('github-name');
  
  const loaderContainer = document.getElementById('github-repos-loader');
  const reposGrid = document.getElementById('recent-repos-list');
  
  // Local Cached Repos Fallbacks (if API limits hit)
  const fallbackRepos = [
    {
      name: 'fake-news-detection',
      description: 'Multilingual AI-powered Fake News Detection System using Machine Learning models and NLP pipelines.',
      language: 'Python',
      html_url: 'https://github.com/saurav827/fake-news-detection',
      stargazers_count: 5,
      forks_count: 2
    },
    {
      name: 'loan-approval-prediction',
      description: 'Machine Learning model predicting credit approval metrics based on historical dataset parameters.',
      language: 'Python',
      html_url: 'https://github.com/saurav827/loan-approval-prediction',
      stargazers_count: 3,
      forks_count: 0
    },
    {
      name: 'ai-chatbot',
      description: 'Conversational assistant using natural dialog structures, semantic prompts, and api bindings.',
      language: 'Python',
      html_url: 'https://github.com/saurav827/ai-chatbot',
      stargazers_count: 3,
      forks_count: 1
    }
  ];

  // 1. Fetch Profile Info
  fetch(`https://api.github.com/users/${username}`)
    .then(response => {
      if (!response.ok) throw new Error('API Rate Limit or Offline');
      return response.json();
    })
    .then(data => {
      if (followersCountEl) followersCountEl.textContent = data.followers;
      if (reposCountEl) reposCountEl.textContent = data.public_repos;
      if (totalGistsEl) totalGistsEl.textContent = data.public_gists || 0;
      if (avatarEl && data.avatar_url) avatarEl.src = data.avatar_url;
      if (profileNameEl && data.name) profileNameEl.textContent = data.name;
    })
    .catch(err => {
      console.warn("Using profile stats fallbacks:", err.message);
      if (followersCountEl) followersCountEl.textContent = '12';
      if (reposCountEl) reposCountEl.textContent = '18';
      if (totalGistsEl) totalGistsEl.textContent = '2';
      if (profileNameEl) profileNameEl.textContent = 'Saurav Kumar';
    });

  // 2. Fetch Recent Repositories
  fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=4`)
    .then(response => {
      if (!response.ok) throw new Error('Repo fetch rate limit exceeded');
      return response.json();
    })
    .then(repos => {
      // Hide loader and display list
      if (loaderContainer) loaderContainer.style.display = 'none';
      if (reposGrid) {
        reposGrid.innerHTML = ''; // Clear skeleton markers
        
        repos.forEach(repo => {
          const repoCard = createRepoCard(repo);
          reposGrid.appendChild(repoCard);
        });
      }
    })
    .catch(err => {
      console.warn("Using recent repos fallback data:", err.message);
      // Hide loader and load cached items
      if (loaderContainer) loaderContainer.style.display = 'none';
      if (reposGrid) {
        reposGrid.innerHTML = '';
        fallbackRepos.forEach(repo => {
          const repoCard = createRepoCard(repo);
          reposGrid.appendChild(repoCard);
        });
      }
    });

  // Generate Procedural Activity Chart
  generateProceduralGraph();
});

// Helper: Generate Repository Card DOM node
function createRepoCard(repo) {
  const card = document.createElement('a');
  card.className = 'repo-card';
  card.href = repo.html_url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  
  const langClass = repo.language ? `lang-${repo.language.toLowerCase()}` : '';
  const langName = repo.language || 'Code';

  card.innerHTML = `
    <div class="repo-header">
      <h4>${repo.name}</h4>
      <p class="repo-desc">${repo.description || 'No description available for this repository.'}</p>
    </div>
    <div class="repo-footer">
      <span class="repo-lang">
        <span class="lang-dot ${langClass}"></span>
        <span>${langName}</span>
      </span>
      <span>⭐ ${repo.stargazers_count || 0}</span>
    </div>
  `;
  return card;
}

// Helper: Create Mock Commit graph
function generateProceduralGraph() {
  const container = document.getElementById('github-graph');
  if (!container) return;
  
  container.innerHTML = '';
  
  const isMobile = window.innerWidth < 600;
  const colsCount = isMobile ? 24 : 53;
  const rowsCount = 7;
  
  for (let r = 0; r < rowsCount; r++) {
    const row = document.createElement('div');
    row.className = 'graph-row';
    
    for (let c = 0; c < colsCount; c++) {
      const cell = document.createElement('div');
      
      const dayOfWeek = r;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      let randVal = Math.random();
      
      let level = 0;
      if (isWeekend) {
        if (randVal > 0.88) level = 1;
        else if (randVal > 0.96) level = 2;
      } else {
        if (randVal > 0.92) level = 4;
        else if (randVal > 0.78) level = 3;
        else if (randVal > 0.55) level = 2;
        else if (randVal > 0.3) level = 1;
      }
      
      cell.className = `graph-cell level-${level}`;
      
      let commits = 0;
      if (level === 1) commits = Math.floor(Math.random() * 2) + 1;
      else if (level === 2) commits = Math.floor(Math.random() * 3) + 3;
      else if (level === 3) commits = Math.floor(Math.random() * 4) + 6;
      else if (level === 4) commits = Math.floor(Math.random() * 6) + 10;
      
      const tooltip = commits > 0 ? `${commits} commits` : 'No commits';
      cell.title = tooltip;
      
      row.appendChild(cell);
    }
    
    container.appendChild(row);
  }
}
