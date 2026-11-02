const pillNav = document.querySelector('.topbar');
const pillHero = document.querySelector('.work-hero');

if (pillNav && pillHero) {
  const sectionLinks = [...pillNav.querySelectorAll('.nav-links a[href^="#"]')];
  const aboutSection = document.querySelector('#about');
  let scheduled = false;

  const updateNav = () => {
    scheduled = false;
    const heroBottom = pillHero.getBoundingClientRect().bottom;
    pillNav.classList.toggle('is-compact', heroBottom <= 120);

    const activeHash = aboutSection && aboutSection.getBoundingClientRect().top <= 140
      ? '#about'
      : heroBottom <= window.innerHeight * 0.5 ? '#work' : '#hero';
    for (const link of sectionLinks) {
      if (link.getAttribute('href') === activeHash) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  const queueUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateNav);
  };

  updateNav();
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
}
