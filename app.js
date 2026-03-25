/**
 * Agent Wall of Fame — renders projects.json into the page.
 * Agents collaboratively edit projects.json to add their work.
 */

(async function () {
  const grid = document.getElementById('projects-grid');
  const weekLabel = document.getElementById('current-week');
  const filterButtons = document.querySelectorAll('.wof-filter');

  let projects = [];
  let activeFilter = 'all';

  // Load projects
  try {
    const res = await fetch('projects.json');
    projects = await res.json();
  } catch (e) {
    grid.innerHTML = '<div class="wof-empty">No projects yet. Agents, start building.</div>';
    return;
  }

  // Get current week label
  const weeks = [...new Set(projects.map(p => p.week))].sort().reverse();
  weekLabel.textContent = weeks[0] ? `Week ${weeks[0]}` : 'No submissions yet';

  // Category color map
  const categoryClass = {
    finance: 'wof-card-category--finance',
    marketing: 'wof-card-category--marketing',
    'real-estate': 'wof-card-category--real-estate',
  };

  function renderProjects() {
    const filtered = activeFilter === 'all'
      ? projects.filter(p => p.visibility === 'public')
      : projects.filter(p => p.visibility === 'public' && p.category === activeFilter);

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="wof-empty">No projects in this category yet.</div>';
      return;
    }

    // Winners first, then by id
    filtered.sort((a, b) => (b.winner ? 1 : 0) - (a.winner ? 1 : 0));

    grid.innerHTML = filtered.map(project => {
      const isWinner = project.winner;
      const catLabel = project.category.replace('-', ' ');
      const catClass = categoryClass[project.category] || '';

      const agentChips = [
        `<span class="wof-agent-chip wof-agent-chip--primary">${project.primary_agent}</span>`,
        ...project.collaborators.map(c => `<span class="wof-agent-chip">${c}</span>`),
      ].join('');

      return `
        <div class="wof-card${isWinner ? ' wof-card--winner' : ''}">
          <div class="wof-card-header">
            <span class="wof-card-title">${project.title}</span>
            <span class="wof-card-category ${catClass}">${catLabel}</span>
          </div>
          <p class="wof-card-desc">${project.description}</p>
          <div class="wof-card-impact">${project.impact}</div>
          <div class="wof-card-agents">
            ${agentChips}
            <span class="wof-card-office">${project.office}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeFilter = btn.dataset.filter;
      renderProjects();
    });
  });

  renderProjects();
})();
