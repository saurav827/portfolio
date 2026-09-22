// ═══════════════════════════════════════════════════════
// github.js — Live GitHub API integration
// Shows real stats when API succeeds; shows "--" + link
// when rate-limited. Removes fake contribution graph.
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const username = 'saurav827';
  const profileUrl = `https://api.github.com/users/${username}`;
  const reposUrl   = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;

  const followersEl = document.getElementById('github-followers');
  const reposEl     = document.getElementById('github-repos');
  const gistsEl     = document.getElementById('github-gists');
  const avatarEl    = document.getElementById('github-avatar');
  const nameEl      = document.getElementById('github-name');
  const loaderEl    = document.getElementById('github-repos-loader');
  const reposGrid   = document.getElementById('recent-repos-list');
  const noteEl      = document.getElementById('github-api-note');

  // ── Fetch profile stats ─────────────────────────────
  fetch(profileUrl)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      if (followersEl) followersEl.textContent = data.followers ?? '--';
      if (reposEl)     reposEl.textContent     = data.public_repos ?? '--';
      if (gistsEl)     gistsEl.textContent     = data.public_gists ?? '0';
      if (avatarEl && data.avatar_url) avatarEl.src = data.avatar_url;
      if (nameEl   && data.name)       nameEl.textContent = data.name;
      if (noteEl) noteEl.style.display = 'none';
    })
    .catch(err => {
      console.warn('[github.js] Profile fetch failed:', err.message);
      // Show "--" and surface the note
      [followersEl, reposEl, gistsEl].forEach(el => {
        if (el) el.textContent = '--';
      });
      if (noteEl) noteEl.style.display = 'block';
    });

  // ── Fetch recent repos ──────────────────────────────
  fetch(reposUrl)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(repos => {
      if (loaderEl) loaderEl.style.display = 'none';
      if (!reposGrid) return;
      reposGrid.innerHTML = '';

      if (!repos.length) {
        reposGrid.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">No public repositories found.</p>';
        return;
      }

      repos.slice(0, 4).forEach(repo => {
        reposGrid.appendChild(createRepoCard(repo));
      });
    })
    .catch(err => {
      console.warn('[github.js] Repos fetch failed:', err.message);
      if (loaderEl) loaderEl.style.display = 'none';
      if (reposGrid) {
        reposGrid.innerHTML = `
          <p style="color:var(--text-muted);font-size:0.88rem;font-family:var(--font-mono);">
            Could not load repositories right now.
            <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">
              View on GitHub →
            </a>
          </p>`;
      }
    });
});

// ── Build a repo card element ────────────────────────
function createRepoCard(repo) {
  const a = document.createElement('a');
  a.className = 'repo-card';
  a.href      = repo.html_url;
  a.target    = '_blank';
  a.rel       = 'noopener noreferrer';
  a.setAttribute('aria-label', `GitHub repository: ${repo.name}`);

  const lang     = repo.language || '';
  const langDot  = lang ? `<span class="lang-dot lang-${lang.toLowerCase()}"></span>` : '';
  const langName = lang || 'Code';

  a.innerHTML = `
    <div class="repo-header">
      <h4>${escapeHtml(repo.name)}</h4>
      <p class="repo-desc">${escapeHtml(repo.description || 'No description available.')}</p>
    </div>
    <div class="repo-footer">
      <span class="repo-lang">${langDot}<span>${escapeHtml(langName)}</span></span>
      <span aria-label="${repo.stargazers_count || 0} stars">⭐ ${repo.stargazers_count || 0}</span>
    </div>
  `;
  return a;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
