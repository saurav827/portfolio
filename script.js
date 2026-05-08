// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80, // Offset for fixed navbar
        behavior: 'smooth'
      });
    }
  });
});

// Simple Form Submission Handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button');
    const originalText = submitBtn.innerText;
    
    // Simulate sending
    submitBtn.innerText = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      submitBtn.innerText = 'Message Sent!';
      submitBtn.style.background = '#22c55e';
      contactForm.reset();
      
      setTimeout(() => {
        submitBtn.innerText = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    }, 1500);
  });
}