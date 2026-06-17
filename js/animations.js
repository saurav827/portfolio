// Intersection Observer for scroll entrance animations
document.addEventListener('DOMContentLoaded', () => {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Stop observing once animation has run
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(revealCallback, options);

  // Target reveal elements
  const revealElements = document.querySelectorAll('.reveal-el');
  revealElements.forEach(el => observer.observe(el));
});
