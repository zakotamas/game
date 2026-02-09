const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if(hamburger){
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}