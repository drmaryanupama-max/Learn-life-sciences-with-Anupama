/**
 * Dr. Anupama Biochemistry & Biotechnology Hub
 * Frontend Interactive Controller
 */

// Embed dataset or fetch from data.json
let siteData = [];
let activeCategory = 'all';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await loadData();
  renderSpotlight();
  renderCategories();
  initSearch();
  initModal();
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
// File Viewer Helper
// ==========================================================================

/**
 * Returns the best viewer URL for a given relative file path.
 * - PDFs: open directly (browser renders inline)
 * - DOCX / DOC / PPTX: open via Microsoft Office Online viewer
 *   using the page's public base URL so it works on GitHub Pages & Cloudflare.
 */
function getViewerUrl(relPath) {
  const ext = relPath.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    return relPath; // browser opens PDFs natively
  }
  // Build the absolute public URL for Office viewer
  const base = window.location.href.replace(/\/[^/]*$/, ''); // strip filename
  const absUrl = encodeURIComponent(base + '/' + relPath);
  return `https://view.officeapps.live.com/op/view.aspx?src=${absUrl}`;
}

function openFile(relPath, filename) {
  window.open(getViewerUrl(relPath), '_blank');
}

// ==========================================================================
// Data Fetching & Loading
// ==========================================================================

async function loadData() {
  try {
    const res = await fetch('data.json');
    if (res.ok) {
      siteData = await res.json();
    }
  } catch (e) {
    console.warn("Could not load external data.json directly, falling back to window.EMBEDDED_DATA", e);
    if (window.EMBEDDED_DATA) {
      siteData = window.EMBEDDED_DATA;
    }
  }
  
  updateStats();
  renderCategoryPills();
}

function updateStats() {
  const totalCategories = siteData.length;
  let totalTopics = 0;
  let totalFiles = 0;
  
  siteData.forEach(cat => {
    totalTopics += cat.topics.length;
    cat.topics.forEach(t => {
      totalFiles += t.files.length;
    });
  });
  
  document.getElementById('statCategories').textContent = totalCategories;
  document.getElementById('statTopics').textContent = totalTopics;
  document.getElementById('statFiles').textContent = totalFiles;
}

// ==========================================================================
// Category Pills Filter
// ==========================================================================

function renderCategoryPills() {
  const container = document.getElementById('categoryPills');
  if (!container) return;
  
  container.innerHTML = `
    <button class="pill-btn active" data-cat="all">
      <i class="fa-solid fa-layer-group"></i> All Modules
    </button>
  `;
  
  siteData.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'pill-btn';
    btn.dataset.cat = cat.name;
    btn.innerHTML = `<i class="fa-solid ${cat.icon || 'fa-folder'}"></i> ${cat.name}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = cat.name;
      renderCategories();
    });
    container.appendChild(btn);
  });
  
  container.querySelector('[data-cat="all"]').addEventListener('click', function() {
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeCategory = 'all';
    renderCategories();
  });
}

// ==========================================================================
// Spotlight Cards (Featured Books & Dissertations)
// ==========================================================================

function renderSpotlight() {
  const grid = document.getElementById('spotlightGrid');
  if (!grid) return;
  
  const spotlightItems = [
    {
      title: "Fundamentals of Biochemistry (AC Deb)",
      badge: "Standard Textbook",
      icon: "fa-book-medical",
      desc: "Complete comprehensive digital textbook of Medical Biochemistry covering all foundational principles, diagnostic tests, and molecular pathways.",
      file: "materials/Clinical%20Biochemistry/fundamentals%20of%20bochemistry%20by%20AC%20Deb.pdf",
      filename: "fundamentals of bochemistry by AC Deb.pdf",
      size: "21.4 MB",
      type: "PDF"
    },
    {
      title: "Ph.D. Thesis: Optimization & Bioethanol Production",
      badge: "Doctoral Dissertation",
      icon: "fa-graduation-cap",
      desc: "Complete doctoral dissertation by Dr. Anupama: All research chapters from Literature Review to Experimental Methods, Results & Discussion.",
      file: "materials/My%20Ph%20D%20Thesis%20Optimization%20And%20Production%20Of%20Ethanol/introduction.docx",
      filename: "introduction.docx",
      size: "Complete 7 Chapters",
      type: "DOCX"
    },
    {
      title: "Bioanalytical Techniques Book",
      badge: "Laboratory Reference",
      icon: "fa-atom",
      desc: "In-depth guide covering Chromatography, Electrophoresis, Spectrophotometry, Centrifugation, and Diagnostic Assay instrumentation.",
      file: "materials/Bioanalytical%20Techniques%20Book/Analytical%20Techniques%20book.pdf",
      filename: "Analytical Techniques book.pdf",
      size: "7.5 MB",
      type: "PDF"
    },
    {
      title: "Downstream Processing Lab Manual",
      badge: "Practical Protocol",
      icon: "fa-vial-circle-check",
      desc: "Standard practical operating procedures and laboratory experiments for bioprocess recovery, isolation, and enzyme extraction.",
      file: "materials/Laboratory%20Manuals/Down%20stream%20processing%20lab%20manual.doc",
      filename: "Down stream processing lab manual.doc",
      size: "363 KB",
      type: "DOC"
    }
  ];
  
  grid.innerHTML = spotlightItems.map(item => `
    <div class="spotlight-card">
      <div>
        <div class="spotlight-badge">
          <i class="fa-solid ${item.icon}"></i> ${item.badge}
        </div>
        <h3 class="spotlight-title">${item.title}</h3>
        <p class="spotlight-desc">${item.desc}</p>
      </div>
      <div class="spotlight-footer">
        <span class="file-meta-pill"><i class="fa-solid fa-file"></i> ${item.size} (${item.type})</span>
        <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
          <button onclick="openFile('${item.file}', '${item.filename}')" class="btn-primary" style="padding: 0.45rem 1rem; font-size: 0.82rem; cursor:pointer; border:none;">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <a href="${item.file}" download="${item.filename}" class="btn-outline" style="padding: 0.45rem 1rem; font-size: 0.82rem;">
            <i class="fa-solid fa-download"></i> Download
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// Category & Topic Rendering
// ==========================================================================

function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;
  
  let filtered = siteData;
  
  // Filter by category pill
  if (activeCategory !== 'all') {
    filtered = filtered.filter(c => c.name === activeCategory);
  }
  
  // Filter by search query
  if (currentSearchQuery.trim() !== '') {
    const q = currentSearchQuery.toLowerCase();
    filtered = filtered.map(cat => {
      const matchingTopics = cat.topics.filter(t => {
        const topicMatches = t.title.toLowerCase().includes(q);
        const fileMatches = t.files.some(f => f.filename.toLowerCase().includes(q));
        return topicMatches || fileMatches;
      });
      
      const catMatches = cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q);
      
      if (catMatches || matchingTopics.length > 0) {
        return {
          ...cat,
          topics: matchingTopics.length > 0 ? matchingTopics : cat.topics
        };
      }
      return null;
    }).filter(Boolean);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--text-subtle); margin-bottom: 1rem;"></i>
        <h3>No matching topics or documents found</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Try refining your search keyword or clearing the filter.</p>
        <button class="btn-primary" style="margin-top: 1.5rem;" onclick="resetSearch()">
          <i class="fa-solid fa-rotate-left"></i> Reset Search
        </button>
      </div>
    `;
    return;
  }
  
  const shouldExpandAll = currentSearchQuery.trim() !== '' || activeCategory !== 'all';
  
  container.innerHTML = filtered.map((cat, idx) => {
    const isExpanded = shouldExpandAll || idx === 0;
    const totalFiles = cat.topics.reduce((acc, t) => acc + t.files.length, 0);
    
    return `
      <div class="category-card ${isExpanded ? 'expanded' : ''}" id="cat-${cat.name.replace(/[^a-zA-Z0-9]/g, '-')}">
        <div class="category-header" onclick="toggleCategory(this)">
          <div class="cat-title-group">
            <div class="cat-icon-box">
              <i class="fa-solid ${cat.icon || 'fa-folder-open'}"></i>
            </div>
            <div>
              <h3 class="cat-name">${cat.name}</h3>
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 0.2rem;">
                <span class="cat-badge">${cat.badge || 'Academic Module'}</span>
                <span class="cat-count">• ${cat.topics.length} Topics (${totalFiles} Files)</span>
              </div>
            </div>
          </div>
          <div class="cat-toggle-icon">
            <i class="fa-solid fa-chevron-down"></i>
          </div>
        </div>
        
        <div class="category-body">
          <p class="category-description">${cat.description}</p>
          <div class="topics-grid">
            ${cat.topics.map(topic => `
              <div class="topic-item-card">
                <div>
                  <div class="topic-header">
                    <i class="fa-solid fa-file-lines topic-icon"></i>
                    <h4 class="topic-title">${topic.title}</h4>
                  </div>
                </div>
                
                <div class="files-list">
                  ${topic.files.length > 0 ? topic.files.map(f => {
                    const extClass = `ext-${f.ext}`;
                    return `
                      <div class="file-item-btn">
                        <div class="file-btn-left" style="flex:1; min-width:0;" onclick="openFile('${f.rel_path}', '${f.filename}')" style="cursor:pointer;">
                          <span class="ext-badge ${extClass}">${f.ext}</span>
                          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor:pointer;" title="Click to view">${f.filename}</span>
                        </div>
                        <div style="display:flex; gap:0.4rem; align-items:center; flex-shrink:0;">
                          <button onclick="openFile('${f.rel_path}', '${f.filename}')" title="View in browser" style="background:var(--primary-light); color:var(--primary); border:none; border-radius:6px; padding:0.25rem 0.55rem; font-size:0.75rem; cursor:pointer; font-weight:600;">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <a href="${f.rel_path}" download="${f.filename}" title="Download file" style="background:var(--bg-surface); color:var(--text-muted); border:1px solid var(--border-subtle); border-radius:6px; padding:0.25rem 0.55rem; font-size:0.75rem; text-decoration:none; font-weight:600;">
                            <i class="fa-solid fa-download"></i>
                          </a>
                        </div>
                      </div>
                    `;
                  }).join('') : `
                    <div style="font-size: 0.85rem; color: var(--text-subtle); padding: 0.5rem 0;">
                      <i class="fa-solid fa-circle-info"></i> Lecture notes & slides available in module
                    </div>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleCategory(header) {
  const card = header.closest('.category-card');
  card.classList.toggle('expanded');
}

// ==========================================================================
// Search Functionality
// ==========================================================================

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    if (clearBtn) {
      clearBtn.style.display = currentSearchQuery.length > 0 ? 'block' : 'none';
    }
    renderCategories();
  });
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetSearch();
    });
  }
}

function resetSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  if (searchInput) searchInput.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  currentSearchQuery = '';
  activeCategory = 'all';
  document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('.pill-btn[data-cat="all"]');
  if (allBtn) allBtn.classList.add('active');
  renderCategories();
}

// ==========================================================================
// Document Preview Modal
// ==========================================================================

function initModal() {
  const backdrop = document.getElementById('documentModal');
  const closeBtn = document.getElementById('closeModalBtn');
  
  if (closeBtn && backdrop) {
    closeBtn.addEventListener('click', () => {
      backdrop.classList.remove('active');
      document.getElementById('modalIframe').src = '';
    });
    
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
        document.getElementById('modalIframe').src = '';
      }
    });
  }
}

function openPreview(url, title) {
  const backdrop = document.getElementById('documentModal');
  const iframe = document.getElementById('modalIframe');
  const titleElem = document.getElementById('modalDocTitle');
  const downloadLink = document.getElementById('modalDownloadLink');
  
  if (backdrop && iframe) {
    titleElem.textContent = title;
    iframe.src = url;
    downloadLink.href = url;
    backdrop.classList.add('active');
  }
}
