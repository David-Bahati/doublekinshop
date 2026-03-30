// Fonction pour gérer le choix du profil
function choisirProfil(role) {
    alert("Vous avez choisi le profil : " + role.toUpperCase());
    
    // Bientôt : On vérifiera ici les permissions avant de rediriger
    // Pour l'instant, on redirigera vers le dossier correspondant (qui est vide)
    window.location.href = role + "/index.html"; 
}
const btnMenu = document.getElementById('btn-menu');
const btnClose = document.getElementById('btn-close');
const sideMenu = document.getElementById('side-menu');

// Ouvrir le menu
btnMenu.addEventListener('click', () => {
    sideMenu.classList.add('ouvert');
});

// Fermer le menu
btnClose.addEventListener('click', () => {
    sideMenu.classList.remove('ouvert');
});
