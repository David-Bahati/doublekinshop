// Fonction pour gérer le choix du profil
function choisirProfil(role) {
    alert("Vous avez choisi le profil : " + role.toUpperCase());
    
    // Bientôt : On vérifiera ici les permissions avant de rediriger
    // Pour l'instant, on redirigera vers le dossier correspondant (qui est vide)
    window.location.href = role + "/index.html"; 
}
