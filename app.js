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
  renderYouTubeVideos();
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
        <button onclick="openFile('${item.file}', '${item.filename}')" class="btn-primary" style="padding: 0.45rem 1rem; font-size: 0.82rem; cursor:pointer; border:none;">
          <i class="fa-solid fa-eye"></i> View
        </button>
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
                      <div class="file-item-btn" onclick="openFile('${f.rel_path}', '${f.filename}')" style="cursor:pointer;" title="Click to view">
                        <div class="file-btn-left">
                          <span class="ext-badge ${extClass}">${f.ext}</span>
                          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.filename}</span>
                        </div>
                        <span style="font-size:0.75rem; color:var(--primary); font-weight:600; flex-shrink:0;">
                          <i class="fa-solid fa-eye"></i> View
                        </span>
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


// ==========================================================================
// YouTube Video Lectures Dataset & Controller
// ==========================================================================

const YOUTUBE_VIDEOS = [
  {
    "sno": 1,
    "subject": "Environmental Biochemistry",
    "title": "Degradation of Phenol",
    "url": "https://www.youtube.com/watch?v=V6JzW5yzmv0",
    "videoId": "V6JzW5yzmv0",
    "thumbnail": "https://img.youtube.com/vi/V6JzW5yzmv0/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 2,
    "subject": "Biochemistry \u2013 Proteins",
    "title": "Basics of Amino Acids and Proteins",
    "url": "https://www.youtube.com/watch?v=NZQ1RN1GL1M",
    "videoId": "NZQ1RN1GL1M",
    "thumbnail": "https://img.youtube.com/vi/NZQ1RN1GL1M/hqdefault.jpg",
    "section": "Metabolism & Proteins"
  },
  {
    "sno": 3,
    "subject": "Food Science / Food Safety",
    "title": "Food Safety Management Tools",
    "url": "https://www.youtube.com/watch?v=r03QFXTDNKE",
    "videoId": "r03QFXTDNKE",
    "thumbnail": "https://img.youtube.com/vi/r03QFXTDNKE/hqdefault.jpg",
    "section": "Food Science & Safety"
  },
  {
    "sno": 4,
    "subject": "Food Safety",
    "title": "Introduction to Management of Food Hazards",
    "url": "https://www.youtube.com/watch?v=nqj0W4jTK-k",
    "videoId": "nqj0W4jTK-k",
    "thumbnail": "https://img.youtube.com/vi/nqj0W4jTK-k/hqdefault.jpg",
    "section": "Food Science & Safety"
  },
  {
    "sno": 5,
    "subject": "Enzymology",
    "title": "Nomenclature of Enzymes",
    "url": "https://www.youtube.com/watch?v=cv5fRz4WmrA",
    "videoId": "cv5fRz4WmrA",
    "thumbnail": "https://img.youtube.com/vi/cv5fRz4WmrA/hqdefault.jpg",
    "section": "Enzymology"
  },
  {
    "sno": 6,
    "subject": "Enzymology",
    "title": "Introduction to Enzymology",
    "url": "https://www.youtube.com/watch?v=QSpWnIxbrjY",
    "videoId": "QSpWnIxbrjY",
    "thumbnail": "https://img.youtube.com/vi/QSpWnIxbrjY/hqdefault.jpg",
    "section": "Enzymology"
  },
  {
    "sno": 7,
    "subject": "Enzymology",
    "title": "Interaction Between Enzyme and Substrate",
    "url": "https://www.youtube.com/watch?v=-cB0a9TFiPg",
    "videoId": "-cB0a9TFiPg",
    "thumbnail": "https://img.youtube.com/vi/-cB0a9TFiPg/hqdefault.jpg",
    "section": "Enzymology"
  },
  {
    "sno": 8,
    "subject": "Enzymology",
    "title": "Enzyme Specificity and Active Site",
    "url": "https://www.youtube.com/watch?v=RRohbEJRePo",
    "videoId": "RRohbEJRePo",
    "thumbnail": "https://img.youtube.com/vi/RRohbEJRePo/hqdefault.jpg",
    "section": "Enzymology"
  },
  {
    "sno": 9,
    "subject": "Plant Biochemistry",
    "title": "Nitrogen Fixation Part 3 \u2013 Assimilation of Nitrogen",
    "url": "https://www.youtube.com/watch?v=4dq8VL_KMd0",
    "videoId": "4dq8VL_KMd0",
    "thumbnail": "https://img.youtube.com/vi/4dq8VL_KMd0/hqdefault.jpg",
    "section": "Plant Biochemistry & Microbiology"
  },
  {
    "sno": 10,
    "subject": "Plant Biochemistry",
    "title": "Nitrogen Fixation Part 2 \u2013 Types of Nitrogen Fixation",
    "url": "https://www.youtube.com/watch?v=F06H7OKroVs",
    "videoId": "F06H7OKroVs",
    "thumbnail": "https://img.youtube.com/vi/F06H7OKroVs/hqdefault.jpg",
    "section": "Plant Biochemistry & Microbiology"
  },
  {
    "sno": 11,
    "subject": "Plant Biochemistry",
    "title": "Nitrogen Fixation Part 1 \u2013 Nitrogen Cycle",
    "url": "https://www.youtube.com/watch?v=fxNyJ2gupAU",
    "videoId": "fxNyJ2gupAU",
    "thumbnail": "https://img.youtube.com/vi/fxNyJ2gupAU/hqdefault.jpg",
    "section": "Plant Biochemistry & Microbiology"
  },
  {
    "sno": 12,
    "subject": "Microbiology",
    "title": "Introduction to Microbiology",
    "url": "https://www.youtube.com/watch?v=XcalEBhaMYs",
    "videoId": "XcalEBhaMYs",
    "thumbnail": "https://img.youtube.com/vi/XcalEBhaMYs/hqdefault.jpg",
    "section": "Plant Biochemistry & Microbiology"
  },
  {
    "sno": 13,
    "subject": "Environmental Science",
    "title": "A Clip of Talk on Earth Hour for FEBA Ministries",
    "url": "https://www.youtube.com/watch?v=-C4auZArAvM",
    "videoId": "-C4auZArAvM",
    "thumbnail": "https://img.youtube.com/vi/-C4auZArAvM/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 14,
    "subject": "Environmental Science / Water Conservation",
    "title": "Catch the Rain When It Falls, Where It Falls",
    "url": "https://www.youtube.com/watch?v=Qzk-ogp5h20",
    "videoId": "Qzk-ogp5h20",
    "thumbnail": "https://img.youtube.com/vi/Qzk-ogp5h20/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 15,
    "subject": "Clinical Biochemistry",
    "title": "Hemoglobin Related Disorders",
    "url": "https://www.youtube.com/watch?v=C5PiBhG1NZQ",
    "videoId": "C5PiBhG1NZQ",
    "thumbnail": "https://img.youtube.com/vi/C5PiBhG1NZQ/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 16,
    "subject": "Clinical Biochemistry",
    "title": "Disorders of Lipid Metabolism",
    "url": "https://www.youtube.com/watch?v=NNaGfkcigKc",
    "videoId": "NNaGfkcigKc",
    "thumbnail": "https://img.youtube.com/vi/NNaGfkcigKc/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 17,
    "subject": "Clinical Biochemistry",
    "title": "Disorders of Carbohydrate Metabolism",
    "url": "https://www.youtube.com/watch?v=7_ywgPVgBfA",
    "videoId": "7_ywgPVgBfA",
    "thumbnail": "https://img.youtube.com/vi/7_ywgPVgBfA/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 18,
    "subject": "Clinical Biochemistry",
    "title": "Kidney Function Tests",
    "url": "https://www.youtube.com/watch?v=7hR5GMU8oAA",
    "videoId": "7hR5GMU8oAA",
    "thumbnail": "https://img.youtube.com/vi/7hR5GMU8oAA/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 19,
    "subject": "Clinical Biochemistry",
    "title": "Liver Function Tests",
    "url": "https://www.youtube.com/watch?v=v7Pz3ulcWd0",
    "videoId": "v7Pz3ulcWd0",
    "thumbnail": "https://img.youtube.com/vi/v7Pz3ulcWd0/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 20,
    "subject": "Clinical Biochemistry",
    "title": "Sample Collection Methods Used in Clinical Laboratories",
    "url": "https://www.youtube.com/watch?v=166NchipvM8",
    "videoId": "166NchipvM8",
    "thumbnail": "https://img.youtube.com/vi/166NchipvM8/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 21,
    "subject": "Immunology",
    "title": "Complement System",
    "url": "https://www.youtube.com/watch?v=YlbTQB2XkeY",
    "videoId": "YlbTQB2XkeY",
    "thumbnail": "https://img.youtube.com/vi/YlbTQB2XkeY/hqdefault.jpg",
    "section": "Immunology"
  },
  {
    "sno": 22,
    "subject": "Clinical Biochemistry",
    "title": "Automation in Clinical Laboratories",
    "url": "https://www.youtube.com/watch?v=qlaseKcgExA",
    "videoId": "qlaseKcgExA",
    "thumbnail": "https://img.youtube.com/vi/qlaseKcgExA/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 23,
    "subject": "Clinical Biochemistry",
    "title": "Gastric Function Tests",
    "url": "https://www.youtube.com/watch?v=lFkPRZtGHBQ",
    "videoId": "lFkPRZtGHBQ",
    "thumbnail": "https://img.youtube.com/vi/lFkPRZtGHBQ/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 24,
    "subject": "Clinical Biochemistry / Vitamins",
    "title": "Fat Soluble Vitamins",
    "url": "https://www.youtube.com/watch?v=M04o9IULKt0",
    "videoId": "M04o9IULKt0",
    "thumbnail": "https://img.youtube.com/vi/M04o9IULKt0/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 25,
    "subject": "Clinical Biochemistry",
    "title": "Introduction to Clinical Biochemistry",
    "url": "https://www.youtube.com/watch?v=hg0OsRfr-KU",
    "videoId": "hg0OsRfr-KU",
    "thumbnail": "https://img.youtube.com/vi/hg0OsRfr-KU/hqdefault.jpg",
    "section": "Clinical Biochemistry"
  },
  {
    "sno": 26,
    "subject": "Biochemistry \u2013 Porphyrin Metabolism",
    "title": "Porphyrin Metabolism",
    "url": "https://www.youtube.com/watch?v=BE8fT4Jm7fk",
    "videoId": "BE8fT4Jm7fk",
    "thumbnail": "https://img.youtube.com/vi/BE8fT4Jm7fk/hqdefault.jpg",
    "section": "Metabolism & Proteins"
  },
  {
    "sno": 27,
    "subject": "Biochemistry \u2013 Nucleotide Metabolism",
    "title": "Nucleotide Metabolism",
    "url": "https://www.youtube.com/watch?v=ciJ5XpDuKiM",
    "videoId": "ciJ5XpDuKiM",
    "thumbnail": "https://img.youtube.com/vi/ciJ5XpDuKiM/hqdefault.jpg",
    "section": "Metabolism & Proteins"
  },
  {
    "sno": 28,
    "subject": "Immunology",
    "title": "Genetic Control of Antibody Diversity / Secretion of Antibodies",
    "url": "https://www.youtube.com/watch?v=7CneCBaHiWU",
    "videoId": "7CneCBaHiWU",
    "thumbnail": "https://img.youtube.com/vi/7CneCBaHiWU/hqdefault.jpg",
    "section": "Immunology"
  },
  {
    "sno": 29,
    "subject": "Immunology",
    "title": "Introduction to Immune System",
    "url": "https://www.youtube.com/watch?v=iYusR8k6Y-M",
    "videoId": "iYusR8k6Y-M",
    "thumbnail": "https://img.youtube.com/vi/iYusR8k6Y-M/hqdefault.jpg",
    "section": "Immunology"
  },
  {
    "sno": 30,
    "subject": "Environmental Science",
    "title": "Environmental Pollution Part II",
    "url": "https://www.youtube.com/watch?v=__bw2I2coG0",
    "videoId": "__bw2I2coG0",
    "thumbnail": "https://img.youtube.com/vi/__bw2I2coG0/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 31,
    "subject": "Environmental Science",
    "title": "Environmental Pollution Part I",
    "url": "https://www.youtube.com/watch?v=R5WX2vaS4Is",
    "videoId": "R5WX2vaS4Is",
    "thumbnail": "https://img.youtube.com/vi/R5WX2vaS4Is/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 32,
    "subject": "Environmental Science / Biodiversity",
    "title": "Biodiversity and Conservation of Biodiversity",
    "url": "https://www.youtube.com/watch?v=K0zggKvnG_w",
    "videoId": "K0zggKvnG_w",
    "thumbnail": "https://img.youtube.com/vi/K0zggKvnG_w/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 33,
    "subject": "Environmental Science / Ecology",
    "title": "Introduction to Ecosystem",
    "url": "https://www.youtube.com/watch?v=oQD3YrQ5r1I",
    "videoId": "oQD3YrQ5r1I",
    "thumbnail": "https://img.youtube.com/vi/oQD3YrQ5r1I/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 34,
    "subject": "Environmental Science / Ecology",
    "title": "Types of Ecosystems",
    "url": "https://www.youtube.com/watch?v=9JSU9zXuJnA",
    "videoId": "9JSU9zXuJnA",
    "thumbnail": "https://img.youtube.com/vi/9JSU9zXuJnA/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 35,
    "subject": "Environmental Science / Ecology",
    "title": "Ecological Pyramids \u2013 Ecosystem",
    "url": "https://www.youtube.com/watch?v=i3IkI_Op4fk",
    "videoId": "i3IkI_Op4fk",
    "thumbnail": "https://img.youtube.com/vi/i3IkI_Op4fk/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 36,
    "subject": "Environmental Science / Ecology",
    "title": "Food Chains of Ecosystem",
    "url": "https://www.youtube.com/watch?v=uut6pqS5bJQ",
    "videoId": "uut6pqS5bJQ",
    "thumbnail": "https://img.youtube.com/vi/uut6pqS5bJQ/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 37,
    "subject": "Environmental Science",
    "title": "Earth Day with FEBA Ministries Online",
    "url": "https://www.youtube.com/watch?v=0HGkq6tzMn8",
    "videoId": "0HGkq6tzMn8",
    "thumbnail": "https://img.youtube.com/vi/0HGkq6tzMn8/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 38,
    "subject": "Food Science / Nutrition",
    "title": "Food Resources",
    "url": "https://www.youtube.com/watch?v=I8Swbadszj0",
    "videoId": "I8Swbadszj0",
    "thumbnail": "https://img.youtube.com/vi/I8Swbadszj0/hqdefault.jpg",
    "section": "Food Science & Safety"
  },
  {
    "sno": 39,
    "subject": "Public Health / COVID-19",
    "title": "2019 nCoV Pandemic \u2013 Strategies for Students and Academics to Overcome Stressful Environment",
    "url": "https://www.youtube.com/watch?v=sBhNA1D_XHs",
    "videoId": "sBhNA1D_XHs",
    "thumbnail": "https://img.youtube.com/vi/sBhNA1D_XHs/hqdefault.jpg",
    "section": "Public Health & Higher Education"
  },
  {
    "sno": 40,
    "subject": "Education / COVID-19",
    "title": "Impact of Online Education and the Tools Being Used for Effective Teaching",
    "url": "https://www.youtube.com/watch?v=dXF4BGaQxRQ",
    "videoId": "dXF4BGaQxRQ",
    "thumbnail": "https://img.youtube.com/vi/dXF4BGaQxRQ/hqdefault.jpg",
    "section": "Public Health & Higher Education"
  },
  {
    "sno": 41,
    "subject": "Public Health / COVID-19",
    "title": "Challenges in the Fields of Medicine and Diagnostics During Post COVID Era",
    "url": "https://www.youtube.com/watch?v=iAPJSP51b_U",
    "videoId": "iAPJSP51b_U",
    "thumbnail": "https://img.youtube.com/vi/iAPJSP51b_U/hqdefault.jpg",
    "section": "Public Health & Higher Education"
  },
  {
    "sno": 42,
    "subject": "Environmental Science / Water Resources",
    "title": "Natural Resources \u2013 Water Resources",
    "url": "https://www.youtube.com/watch?v=la0y4uF_laM",
    "videoId": "la0y4uF_laM",
    "thumbnail": "https://img.youtube.com/vi/la0y4uF_laM/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 43,
    "subject": "Environmental Science / Forest Resources",
    "title": "Natural Resources \u2013 Forest Resources",
    "url": "https://www.youtube.com/watch?v=MJUp_WQTCP0",
    "videoId": "MJUp_WQTCP0",
    "thumbnail": "https://img.youtube.com/vi/MJUp_WQTCP0/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 44,
    "subject": "Environmental Science",
    "title": "Multidisciplinary Nature of Environmental Studies",
    "url": "https://www.youtube.com/watch?v=ddGVCERcJEU",
    "videoId": "ddGVCERcJEU",
    "thumbnail": "https://img.youtube.com/vi/ddGVCERcJEU/hqdefault.jpg",
    "section": "Environmental Studies & Ecology"
  },
  {
    "sno": 45,
    "subject": "Biochemistry \u2013 Amino Acid Metabolism",
    "title": "Metabolism of Branched Chain Amino Acids",
    "url": "https://www.youtube.com/watch?v=aLYc9VDrzLc",
    "videoId": "aLYc9VDrzLc",
    "thumbnail": "https://img.youtube.com/vi/aLYc9VDrzLc/hqdefault.jpg",
    "section": "Metabolism & Proteins"
  },
  {
    "sno": 46,
    "subject": "Biochemistry \u2013 Amino Acid Metabolism",
    "title": "Glucogenic and Ketogenic Amino Acids",
    "url": "https://www.youtube.com/watch?v=_t0l8Y2WeHM",
    "videoId": "_t0l8Y2WeHM",
    "thumbnail": "https://img.youtube.com/vi/_t0l8Y2WeHM/hqdefault.jpg",
    "section": "Metabolism & Proteins"
  },
  {
    "sno": 47,
    "subject": "Biochemistry \u2013 Amino Acid Metabolism",
    "title": "Aromatic Amino Acid Metabolism",
    "url": "https://www.youtube.com/watch?v=bJOoaDcwOsQ",
    "videoId": "bJOoaDcwOsQ",
    "thumbnail": "https://img.youtube.com/vi/bJOoaDcwOsQ/hqdefault.jpg",
    "section": "Metabolism & Proteins"
  },
  {
    "sno": 48,
    "subject": "Biochemistry \u2013 Amino Acid Metabolism",
    "title": "Reactions of Amino Acids",
    "url": "https://www.youtube.com/watch?v=sZbqb0VPenE",
    "videoId": "sZbqb0VPenE",
    "thumbnail": "https://img.youtube.com/vi/sZbqb0VPenE/hqdefault.jpg",
    "section": "Metabolism & Proteins"
  },
  {
    "sno": 49,
    "subject": "Biochemistry \u2013 Urea Cycle",
    "title": "Urea Cycle",
    "url": "https://www.youtube.com/watch?v=xCVty2422fY",
    "videoId": "xCVty2422fY",
    "thumbnail": "https://img.youtube.com/vi/xCVty2422fY/hqdefault.jpg",
    "section": "Metabolism & Proteins"
  },
  {
    "sno": 50,
    "subject": "Immunology",
    "title": "Agglutination and Complement Fixation Reactions",
    "url": "https://www.youtube.com/watch?v=4OZer4q0wTA",
    "videoId": "4OZer4q0wTA",
    "thumbnail": "https://img.youtube.com/vi/4OZer4q0wTA/hqdefault.jpg",
    "section": "Immunology"
  },
  {
    "sno": 51,
    "subject": "Immunology",
    "title": "Precipitation Reactions",
    "url": "https://www.youtube.com/watch?v=e_1bxwFWkxk",
    "videoId": "e_1bxwFWkxk",
    "thumbnail": "https://img.youtube.com/vi/e_1bxwFWkxk/hqdefault.jpg",
    "section": "Immunology"
  },
  {
    "sno": 52,
    "subject": "Immunology",
    "title": "Introduction to Ag-Ab Reactions",
    "url": "https://www.youtube.com/watch?v=8Y4DfaBkKUw",
    "videoId": "8Y4DfaBkKUw",
    "thumbnail": "https://img.youtube.com/vi/8Y4DfaBkKUw/hqdefault.jpg",
    "section": "Immunology"
  },
  {
    "sno": 53,
    "subject": "Immunology",
    "title": "Antigens",
    "url": "https://www.youtube.com/watch?v=I2T5LTUsA8w",
    "videoId": "I2T5LTUsA8w",
    "thumbnail": "https://img.youtube.com/vi/I2T5LTUsA8w/hqdefault.jpg",
    "section": "Immunology"
  },
  {
    "sno": 54,
    "subject": "Immunology",
    "title": "Transplantation Immunology",
    "url": "https://www.youtube.com/watch?v=5achQ-dgvos",
    "videoId": "5achQ-dgvos",
    "thumbnail": "https://img.youtube.com/vi/5achQ-dgvos/hqdefault.jpg",
    "section": "Immunology"
  }
];

let currentVideoSection = 'all';

function renderYouTubeVideos(filterSection = 'all', searchQuery = '') {
  currentVideoSection = filterSection;
  const container = document.getElementById('youtubeVideosContainer');
  const pillsContainer = document.getElementById('videoSectionPills');
  if (!container) return;

  // Group videos by section for counts
  const sectionCounts = {};
  YOUTUBE_VIDEOS.forEach(v => {
    sectionCounts[v.section] = (sectionCounts[v.section] || 0) + 1;
  });

  // Render Video Filter Pills if not already rendered
  if (pillsContainer && pillsContainer.children.length === 0) {
    const allPill = document.createElement('button');
    allPill.className = 'pill-btn active';
    allPill.dataset.vsection = 'all';
    allPill.innerHTML = '<i class="fa-brands fa-youtube" style="color:#ef4444;"></i> All Videos <span class="pill-badge">' + YOUTUBE_VIDEOS.length + '</span>';
    allPill.addEventListener('click', () => filterVideoSection('all'));
    pillsContainer.appendChild(allPill);

    Object.keys(sectionCounts).forEach(sec => {
      const pill = document.createElement('button');
      pill.className = 'pill-btn';
      pill.dataset.vsection = sec;
      pill.innerHTML = sec + ' <span class="pill-badge">' + sectionCounts[sec] + '</span>';
      pill.addEventListener('click', () => filterVideoSection(sec));
      pillsContainer.appendChild(pill);
    });
  }

  // Filter videos
  const q = searchQuery.toLowerCase().trim();
  let filtered = YOUTUBE_VIDEOS.filter(v => {
    const matchesSection = filterSection === 'all' || v.section === filterSection;
    const matchesQuery = !q || v.title.toLowerCase().includes(q) || v.subject.toLowerCase().includes(q) || v.section.toLowerCase().includes(q);
    return matchesSection && matchesQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); grid-column: 1 / -1;">
        <i class="fa-solid fa-video-slash" style="font-size: 2.5rem; color: var(--text-subtle); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.25rem; color: var(--text-main); margin-bottom: 0.5rem;">No matching video lectures found</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try adjusting your search terms or selecting 'All Videos'.</p>
      </div>
    `;
    return;
  }

  // Group filtered videos by section
  const grouped = {};
  filtered.forEach(v => {
    if (!grouped[v.section]) grouped[v.section] = [];
    grouped[v.section].push(v);
  });

  const sectionIcons = {
    "Clinical Biochemistry": "fa-heart-pulse",
    "Immunology": "fa-shield-virus",
    "Enzymology": "fa-flask-vial",
    "Metabolism & Proteins": "fa-dna",
    "Environmental Studies & Ecology": "fa-leaf",
    "Plant Biochemistry & Microbiology": "fa-seedling",
    "Food Science & Safety": "fa-bowl-food",
    "Public Health & Higher Education": "fa-graduation-cap"
  };

  container.innerHTML = Object.keys(grouped).map(sec => {
    const vlist = grouped[sec];
    const icon = sectionIcons[sec] || "fa-youtube";
    return `
      <div class="video-section-group">
        <div class="video-section-header">
          <div class="video-section-title-wrap">
            <i class="fa-solid ${icon}"></i>
            <h3 class="video-section-title">${sec}</h3>
          </div>
          <span class="video-count-badge">${vlist.length} Lecture${vlist.length > 1 ? 's' : ''}</span>
        </div>
        <div class="video-grid">
          ${vlist.map(v => `
            <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="video-card" title="Watch '${v.title}' on YouTube in a new tab">
              <div class="video-thumb-wrapper">
                <img src="${v.thumbnail}" alt="${v.title}" class="video-thumb-img" loading="lazy" onerror="this.src='site_banner.jpg'">
                <div class="video-play-overlay">
                  <i class="fa-solid fa-play"></i>
                </div>
              </div>
              <div class="video-card-body">
                <div>
                  <div class="video-subject-tag">
                    <i class="fa-solid fa-tag"></i> ${v.subject}
                  </div>
                  <h4 class="video-card-title">${v.title}</h4>
                </div>
                <div class="video-card-footer">
                  <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 500;">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Open in YouTube
                  </span>
                  <div class="video-yt-btn">
                    <i class="fa-brands fa-youtube"></i> Watch
                  </div>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function filterVideoSection(section) {
  currentVideoSection = section;
  const pills = document.querySelectorAll('#videoSectionPills .pill-btn');
  pills.forEach(p => {
    if (p.dataset.vsection === section) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  const searchVal = document.getElementById('videoSearchInput')?.value || '';
  renderYouTubeVideos(section, searchVal);
}

// Add event listeners for video search
document.addEventListener('DOMContentLoaded', () => {
  const vSearch = document.getElementById('videoSearchInput');
  const clearVSearch = document.getElementById('clearVideoSearchBtn');

  if (vSearch) {
    vSearch.addEventListener('input', (e) => {
      renderYouTubeVideos(currentVideoSection, e.target.value);
    });
  }

  if (clearVSearch && vSearch) {
    clearVSearch.addEventListener('click', () => {
      vSearch.value = '';
      renderYouTubeVideos(currentVideoSection, '');
    });
  }
});
