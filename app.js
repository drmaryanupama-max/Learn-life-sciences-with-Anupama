/**
 * Dr. Palukurty Mary Anupama - Biochemistry & Biotechnology Academic Hub
 * Lightweight Multi-Page Controller (Zero Dependencies, Instant Load)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initVideoFilters();
  initCurriculumFilters();
});

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

// ==========================================================================
// File Viewer & Downloader Helper
// ==========================================================================

function getViewerUrl(relPath) {
  const ext = relPath.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    return relPath; // browser opens PDFs natively in new tab
  }
  // Build public URL for Microsoft Office Online viewer
  const base = window.location.href.replace(/\/[^/]*$/, '');
  const absUrl = encodeURIComponent(base + '/' + relPath);
  return `https://view.officeapps.live.com/op/view.aspx?src=${absUrl}`;
}

function openFile(relPath, filename) {
  window.open(getViewerUrl(relPath), '_blank');
}

// ==========================================================================
// YouTube Video Filters & Live Search (for youtube.html)
// ==========================================================================

let activeVideoSection = 'all';

function initVideoFilters() {
  const pills = document.querySelectorAll('#videoSectionPills .video-pill-btn');
  const searchInput = document.getElementById('videoSearchInput');
  const clearBtn = document.getElementById('clearVideoSearchBtn');
  const videoGroups = document.querySelectorAll('.video-section-group');

  if (!pills.length && !searchInput) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeVideoSection = pill.dataset.vsection;
      filterVideos();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => filterVideos());
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterVideos();
    });
  }

  function filterVideos() {
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();

    videoGroups.forEach(group => {
      const sectionName = group.dataset.section;
      const matchesSection = activeVideoSection === 'all' || sectionName === activeVideoSection;
      const cards = group.querySelectorAll('.video-card');
      let visibleInGroup = 0;

      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matchesQuery = !q || text.includes(q);

        if (matchesSection && matchesQuery) {
          card.style.display = 'flex';
          visibleInGroup++;
        } else {
          card.style.display = 'none';
        }
      });

      if (matchesSection && visibleInGroup > 0) {
        group.style.display = 'block';
      } else {
        group.style.display = 'none';
      }
    });
  }
}

// ==========================================================================
// Curriculum Accordions & Filters (for curriculum.html)
// ==========================================================================

function toggleCategory(header) {
  const card = header.closest('.category-card');
  if (card) {
    card.classList.toggle('active');
  }
}

function initCurriculumFilters() {
  const pills = document.querySelectorAll('#categoryPills .pill-btn');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const catCards = document.querySelectorAll('.category-card');

  if (!pills.length && !searchInput) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const catId = pill.dataset.cat;
      filterCurriculum(catId, searchInput ? searchInput.value : '');
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activePill = document.querySelector('#categoryPills .pill-btn.active');
      const catId = activePill ? activePill.dataset.cat : 'all';
      filterCurriculum(catId, e.target.value);
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      const activePill = document.querySelector('#categoryPills .pill-btn.active');
      const catId = activePill ? activePill.dataset.cat : 'all';
      filterCurriculum(catId, '');
    });
  }

  function filterCurriculum(activeCat, query) {
    const q = query.toLowerCase().trim();

    catCards.forEach(card => {
      const cardCat = card.dataset.category;
      const matchesCat = activeCat === 'all' || cardCat === activeCat;
      const text = card.textContent.toLowerCase();
      const matchesQuery = !q || text.includes(q);

      if (matchesCat && matchesQuery) {
        card.style.display = 'block';
        if (q) {
          card.classList.add('active'); // auto-expand on search
        }
      } else {
        card.style.display = 'none';
      }
    });
  }
}
