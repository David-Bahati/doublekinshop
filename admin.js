// 1. Charger l'inventaire dès que la page s'affiche
document.addEventListener("DOMContentLoaded", () => {
    afficherInventaire();
});

// 2. Fonction pour ENREGISTRER (Bouton orange du haut)
function enregistrerSysteme() {
    const nom = document.querySelector('input[placeholder="Nom de l\'article"]').value;
    const qte = document.querySelector('input[placeholder="Quantité"]').value;
    const prix = document.querySelector('input[placeholder="Prix (ex: 15$)"]').value;

    if (!nom || !prix) return alert("Veuillez remplir le nom et le prix !");

    let inventaire = JSON.parse(localStorage.getItem('dks_inventaire')) || [];
    inventaire.push({ nom, quantite: qte, prix, id: Date.now() });
    
    localStorage.setItem('dks_inventaire', JSON.stringify(inventaire));
    alert("✅ Enregistré dans le système !");
    afficherInventaire(); // On rafraîchit la liste immédiatement
}

// 3. Fonction pour AFFICHER la liste (Le bloc qui reste vide)
function afficherInventaire() {
    const listeDiv = document.getElementById('liste-admin-produits') || document.querySelector('.admin-card + div') || document.querySelector('h3 + div');
    const inventaire = JSON.parse(localStorage.getItem('dks_inventaire')) || [];

    // Si on ne trouve pas l'ID, on cherche le bloc sous "Inventaire & Gestion"
    const conteneur = document.querySelector('#liste-admin-produits') || document.querySelector('div:has(h3:contains("Inventaire"))');

    if (!inventaire.length) {
        listeDiv.innerHTML = "<p style='color:gray; padding:10px;'>Aucun produit enregistré.</p>";
        return;
    }

    listeDiv.innerHTML = ""; // On nettoie

    inventaire.forEach((prod, index) => {
        listeDiv.innerHTML += `
            <div style="background: #2a2a4e; padding: 12px; margin-bottom: 8px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #ffa500;">
                <div>
                    <strong style="color:white; display:block;">${prod.nom}</strong>
                    <small style="color:#aaa;">Stock: ${prod.quantite} | Prix: ${prod.prix}</small>
                </div>
                <button onclick="supprimerArticle(${index})" style="background:none; border:none; color:#ff4757; font-size:18px; cursor:pointer;">🗑️</button>
            </div>
        `;
    });
}

// 4. Fonction pour SUPPRIMER
function supprimerArticle(index) {
    let inventaire = JSON.parse(localStorage.getItem('dks_inventaire'));
    inventaire.splice(index, 1);
    localStorage.setItem('dks_inventaire', JSON.stringify(inventaire));
    afficherInventaire();
}
