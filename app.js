(() => {
  'use strict';
  const all = (selector) => [...document.querySelectorAll(selector)];
  const byId = (id) => document.getElementById(id);
  const selectButton = (selector, selected) => {
    all(selector).forEach(button => {
      const active = button === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  const locations = {
    roseville: {
      title: 'A direct path to your local consultation.',
      copy: 'Clear contact details, the Roseville schedule, and a confirmation that explains what comes next.'
    },
    walnut: {
      title: 'Plan around the next Walnut Creek clinic.',
      copy: 'Show confirmed clinic dates before someone requests a consultation, then explain how the team will confirm availability.'
    }
  };
  all('[data-location]').forEach(button => {
    button.addEventListener('click', () => {
      const location = locations[button.dataset.location];
      selectButton('[data-location]', button);
      byId('location-title').textContent = location.title;
      byId('location-copy').textContent = location.copy;
    });
  });

  all('[data-phase]').forEach(button => {
    button.addEventListener('click', () => {
      selectButton('[data-phase]', button);
      all('.phase-panel').forEach(panel => {
        panel.hidden = panel.id !== 'phase-' + button.dataset.phase;
      });
    });
  });

  const ideas = {
    doctor: {
      label: '01 / The consultation',
      title: 'WHAT I LOOK AT FIRST.',
      summary: 'A short doctor-led film that shows the thinking behind the consultation, before introducing a treatment.',
      hook: '“Before we talk about a treatment, here is what I want to understand about your goals.” A suggested opening for Dr. Anwar to approve in his own words.',
      shots: 'Dr. Anwar speaking in the practice, cut with the consultation room and a simple visual explanation. No patient footage is needed for this first film.',
      cta: 'Link to a page that explains the consultation and lets someone choose Roseville or Walnut Creek.'
    },
    lift: {
      label: '02 / The signature treatment',
      title: 'MODERN LIFT. CLEARLY EXPLAINED.',
      summary: 'Turn a named treatment into a useful explanation that answers the questions a prospective patient would bring to the room.',
      hook: '“What is Modern Lift, and what should we talk through before deciding whether it fits your goals?”',
      shots: 'Dr. Anwar explains the approach, the assessment, alternatives, and realistic expectations. Use approved diagrams or a consented case only where they add clarity.',
      cta: 'Send viewers to the completed Modern Lift page, with practical questions, approved case context, and the appropriate consultation route.'
    },
    case: {
      label: '03 / The case story',
      title: 'ONE CASE. THE WHOLE STORY.',
      summary: 'Build one strong, approved case story that can become a video, a carousel, and a useful page in the gallery.',
      hook: '“Here was the goal, here was the plan, and here is when these photographs were taken.”',
      shots: 'Consistent before-and-after photographs, treatment and timing labels, and Dr. Anwar explaining the decisions. Choose the case and permissions with the practice.',
      cta: 'Open the full case page, explain that results vary, and offer a relevant consultation step.'
    }
  };
  const dialog = byId('idea-dialog');
  let ideaTrigger = null;
  all('[data-idea]').forEach(button => {
    button.addEventListener('click', () => {
      const idea = ideas[button.dataset.idea];
      ['label', 'title', 'summary', 'hook', 'shots', 'cta'].forEach(key => {
        byId('idea-' + key).textContent = idea[key];
      });
      ideaTrigger = button;
      dialog.showModal();
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (ideaTrigger) ideaTrigger.focus({ preventScroll: true });
  });

  const chapters = all('[data-chapter]');
  const progress = byId('progress');
  const nextChapter = byId('next-chapter');
  let queued = false;
  const updateReading = () => {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (range > 0 ? Math.max(0, Math.min(100, window.scrollY / range * 100)) : 0) + '%';
    let current = 0;
    chapters.forEach((chapter, index) => {
      if (chapter.getBoundingClientRect().top <= window.innerHeight * 0.4) current = index;
    });
    byId('chapter-number').textContent = chapters[current].dataset.chapter;
    nextChapter.href = '#' + chapters[(current + 1) % chapters.length].id;
    nextChapter.textContent = current === chapters.length - 1 ? '↑' : '↓';
    nextChapter.setAttribute('aria-label', current === chapters.length - 1 ? 'Back to the beginning' : 'Next section');
    all('.masthead nav a').forEach(link => {
      if (link.hash === '#' + chapters[current].id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    queued = false;
  };
  const queueReading = () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(updateReading);
    }
  };
  window.addEventListener('scroll', queueReading, { passive: true });
  window.addEventListener('resize', queueReading);
  window.addEventListener('load', queueReading);
  updateReading();

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(pointer: fine)');
  all('[data-tilt]').forEach(stage => {
    stage.addEventListener('pointermove', event => {
      if (motion.matches || !pointer.matches) return;
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty('--mx', (((event.clientX - rect.left) / rect.width - 0.5) * 7) + 'deg');
      stage.style.setProperty('--my', (((event.clientY - rect.top) / rect.height - 0.5) * -5) + 'deg');
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--mx', '0deg');
      stage.style.setProperty('--my', '0deg');
    });
  });

  let detailsWasOpen = false;
  window.addEventListener('beforeprint', () => {
    const details = document.querySelector('.audit-details');
    detailsWasOpen = details.open;
    details.open = true;
  });
  window.addEventListener('afterprint', () => {
    document.querySelector('.audit-details').open = detailsWasOpen;
  });
})();
