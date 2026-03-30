// Initialisation du SDK Pi
const Pi = window.Pi;
Pi.init({ version: "2.0", sandbox: true }); // 'sandbox: true' pour tes tests

async function connecterAvecPi() {
    try {
        // Demande d'authentification à l'utilisateur
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        console.log(`Bienvenue ${auth.user.username} chez Double King !`);
        
        // On stocke le nom de l'utilisateur Pi
        localStorage.setItem('pi_user', auth.user.username);
        
        // Mise à jour de l'interface (ex: afficher son nom dans la navbar)
        alert("Connecté avec succès en tant que : " + auth.user.username);
        
    } catch (err) {
        console.error("Erreur de connexion Pi :", err);
        alert("Impossible de se connecter avec Pi Network.");
    }
}

// Fonction obligatoire pour gérer les paiements interrompus
function onIncompletePaymentFound(payment) {
    console.log("Paiement incomplet trouvé :", payment);
    // Ici on pourra gérer la finalisation plus tard
};

// ==========================================
// 1. BASE DE DONNÉES ET MÉMOIRE
// ==========================================
const articles = [
    { id: 1, nom: "Souris Sans Fil", prix: 10, stock: 12, categorie: "Accessoires" },
    { id: 2, nom: "Clavier AZERTY", prix: 25, stock: 8, categorie: "Accessoires" },
    { id: 3, nom: "Câble USB-C 2m", prix: 5, stock: 20, categorie: "Câbles" },
    // etc...
];



let ventes = JSON.parse(localStorage.getItem('dks_ventes')) || [];

function sauvegarderEtRafraichir() {
    localStorage.setItem('dks_inventory', JSON.stringify(articles));
    localStorage.setItem('dks_ventes', JSON.stringify(ventes));
}

// ==========================================
// 2. FONCTIONS POUR LE CAISSIER
// ==========================================
function preparerCaissier() {
    const select = document.getElementById('select-article');
    if (!select) return;
    select.innerHTML = '<option value="">-- Choisir un article --</option>';
    articles.forEach((item, index) => {
        let option = document.createElement('option');
        option.value = index;
        option.text = item.nom + " (" + item.prix + ")";
        select.add(option);
    });
}

function calculerTotal() {
    const select = document.getElementById('select-article');
    const quantiteInput = document.getElementById('quantite');
    const totalDisplay = document.getElementById('total-prix');
    if (select && select.value !== "") {
        const prixNet = parseInt(articles[select.value].prix.toString().replace('$', ''));
        const qte = parseInt(quantiteInput.value) || 0;
        if (totalDisplay) totalDisplay.innerText = (prixNet * qte);
    }
}

// On utilise bien le nom que TU as dans ton code : validerVente
function validerVente() {
    if (panier.length === 0) {
        alert("Votre panier est vide ! Ajoutez des articles avant de valider la vente.");
        return;
    }

    // Calcul du total
    let totalVente = 0;
    panier.forEach(item => {
        totalVente += parseFloat(item.prix);
    });

    // Confirmation de la transaction
    const confirmation = confirm(`Confirmer la vente de ${totalVente} Pi pour ${panier.length} article(s) ?`);

    if (confirmation) {
        // C'est ici qu'on intègrera plus tard le Pi.createPayment()
        alert(`✅ Vente validée avec succès chez Double King !\nTotal : ${totalVente} Pi`);

        // On vide le panier après la vente
        panier = [];
        
        // On met à jour toute l'interface
        mettreAJourBadgePanier();
        fermerPanier();
        afficherProduitsAccueil(); // Très important pour que les stocks mis à jour restent affichés
        
        console.log("Vente enregistrée dans le système.");
    }
}


// ==========================================
// 3. FONCTIONS POUR L'ADMINISTRATION
// ==========================================
function ajouterArticle() {
    const nom = document.getElementById('new-nom').value.trim();
    const stock = parseInt(document.getElementById('new-stock').value);
    const prix = document.getElementById('new-prix').value.trim();

    if (!nom || isNaN(stock) || !prix) return alert("⚠️ Remplis tous les champs !");

    articles.push({ nom: nom, stock: stock, prix: prix.includes('$') ? prix : prix + "$" });
    sauvegarderEtRafraichir();
    alert("✅ Article enregistré !");
    location.reload();
}

function supprimerArticle(index) {
    if (confirm("Supprimer cet article ?")) {
        articles.splice(index, 1);
        sauvegarderEtRafraichir();
        location.reload();
    }
}

function afficherInventaireAdmin() {
    const container = document.getElementById('admin-inventory');
    if (!container) return;
    container.innerHTML = "<h3>Inventaire Actuel</h3>";
    articles.forEach((item, index) => {
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #ddd; background:white; margin-bottom:5px; border-radius:5px;">
                <span><strong>${item.nom}</strong> (Stock: ${item.stock})</span>
                <button onclick="supprimerArticle(${index})" style="background:#ff5252; color:white; border:none; padding:5px 10px; border-radius:4px;">Suppr.</button>
            </div>`;
    });
}

function afficherHistorique() {
    const container = document.getElementById('historique-ventes');
    if (!container) return;
    container.innerHTML = ventes.length === 0 ? "Aucune vente." : "";
    ventes.slice().reverse().forEach(v => {
        container.innerHTML += `<div style="border-bottom:1px solid #eee; padding:5px; font-size:0.8em;">
            <b>${v.date}</b>: ${v.article} (x${v.quantite}) = ${v.total}$
        </div>`;
    });
}

function effacerHistorique() {
    if (confirm("Effacer tout l'historique ?")) {
        ventes = [];
        sauvegarderEtRafraichir();
        location.reload();
    }
}

// ==========================================
// 4. SÉCURITÉ ET CHARGEMENT
// ==========================================
function ouvrirAdmin() {
    // On ne redemande plus le code ici, car il a été vérifié au Staff Login
    window.location.href = "pages/admin.html";
}


window.onload = function() {
    preparerCaissier();
    afficherInventaireAdmin();
    afficherHistorique();
    
    // Pour la page Vendeur (Simple tableau)
    const tableBody = document.getElementById('vendeur-table-body');
    if (tableBody) {
        articles.forEach(item => {
            tableBody.innerHTML += `<tr><td style="padding:10px; border:1px solid #ddd;">${item.nom}</td>
            <td style="padding:10px; border:1px solid #ddd; text-align:center;">${item.stock}</td>
            <td style="padding:10px; border:1px solid #ddd; text-align:center;">${item.prix}</td></tr>`;
        });
    }
};
// --- SYSTÈME DE LOGIN STAFF ---
function verifierConnexion() {
    // On récupère le mot de passe dans le champ
    const pass = document.getElementById('staff-pass').value;

    if (pass === "DKS-ADMIN") {
        window.location.href = "pages/admin.html";
    } 
    else if (pass === "DKS-CAISSE") {
        window.location.href = "pages/caissier.html";
    }
    else if (pass === "DKS-VENTE") {
        window.location.href = "pages/vendeur.html";
    }
    else {
        alert("❌ Mot de passe incorrect !");
    }
}
// On initialise le panier au début du fichier
let panier = [];

// On ajoute un paramètre "liste" qui vaut "articles" par défaut
function afficherProduitsAccueil(liste = articles) {
    function afficherProduitsAccueil(liste = articles) {
    const grid = document.getElementById('home-products-grid');
    if (!grid) return;

    // Effet de fondu rapide avant d'afficher
    grid.style.opacity = "0";
    
    setTimeout(() => {
        grid.innerHTML = "";
        grid.style.opacity = "1";
        grid.style.transition = "opacity 0.3s ease";

        if (liste.length === 0) {
            grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding:40px;'>Aucun produit trouvé... 📦</p>";
            return;
        }

        liste.forEach((item, index) => {
            // On ajoute un petit délai d'apparition différent pour chaque carte
            const delay = index * 0.05; 
            
            grid.innerHTML += `
                <div class="product-card" style="animation-delay: ${delay}s">
                    <div style="background:#f7fafc; height:100px; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:30px;">
                        📦
                    </div>
                    <h4>${item.nom}</h4>
                    <p class="price">${item.prix} Pi</p>
                    <p class="stock">En stock: ${item.stock}</p>
                    <button class="add-to-cart-btn" onclick="ajouterAuPanier(${item.id})" ${item.stock > 0 ? "" : "disabled"}>
                        ${item.stock > 0 ? "🛒 Ajouter" : "Épuisé"}
                    </button>
                </div>
            `;
        });
    }, 100); // Petit délai de 100ms pour l'effet visuel
}

    const grid = document.getElementById('home-products-grid');
    if (!grid) return;

    grid.innerHTML = "";

    if (liste.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding:20px; color:gray;'>Aucun produit trouvé... 📦</p>";
        return;
    }

    liste.forEach(item => {
        grid.innerHTML += `
            <div class="product-card">
                <div style="background:#f7fafc; height:100px; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:30px;">
                    📦
                </div>
                <h4>${item.nom}</h4>
                <p class="price">${item.prix} Pi</p>
                <p class="stock">En stock: ${item.stock}</p>
                <button class="add-to-cart-btn" onclick="ajouterAuPanier(${item.id})" ${item.stock > 0 ? "" : "disabled"}>
                    ${item.stock > 0 ? "🛒 Ajouter" : "Épuisé"}
                </button>
            </div>
        `;
    });
}



// La fonction qui gère l'ajout
function ajouterAuPanier(id) {
    const article = articles.find(a => a.id === id);
    
    if (article && article.stock > 0) {
        panier.push(article);
        alert(`${article.nom} a été ajouté à votre panier !`);
        
        // Optionnel : On peut aussi décrémenter le stock visuellement ici
        // article.stock--; 
        // afficherProduitsAccueil(); 
    } else {
        alert("Désolé, cet article n'est plus disponible.");
    }
}


// Mets à jour ton window.onload pour inclure la fonction
window.onload = function() {
    preparerCaissier();
    afficherInventaireAdmin();
    afficherHistorique();
    afficherProduitsAccueil(); // <-- AJOUTE CETTE LIGNE
};
// On s'assure que le panier existe
if (typeof panier === 'undefined') {
    let panier = [];
}

// Fonction pour mettre à jour l'affichage de la Navbar
function mettreAJourBadgePanier() {
    const countBadge = document.getElementById('cart-count-badge');
    if (!countBadge) return; // Sécurité si l'élément n'existe pas

    const totalArticles = panier.length;

    if (totalArticles > 0) {
        // On affiche le badge et le nombre
        countBadge.innerText = totalArticles;
        countBadge.style.display = 'flex'; // On l'affiche
    } else {
        // Panier vide = on cache le badge
        countBadge.style.display = 'none';
    }
}

// Mise à jour de ta fonction existante d'ajout au panier
// Assure-toi d'appeler mettreAJourBadgePanier() à la fin.
function ajouterAuPanier(id) {
    // 1. Trouver l'article dans ton catalogue
    const article = articles.find(a => a.id === id);

    if (article) {
        if (article.stock > 0) {
            // 2. Diminuer le stock dans les données
            article.stock--;

            // 3. Ajouter au panier
            panier.push({ ...article });

            // 4. Mettre à jour l'affichage (Badge et Grille)
            mettreAJourBadgePanier();
            afficherProduitsAccueil(); // On rafraîchit la grille pour voir le nouveau stock
            
            console.log(`Stock restant pour ${article.nom} : ${article.stock}`);
        } else {
            alert("Désolé, ce produit est épuisé !");
        }
    }
}
function retirerDuPanier(index) {
    // 1. Récupérer l'article qu'on va supprimer du panier
    const articleARetirer = panier[index];

    // 2. Retrouver cet article dans le catalogue principal pour lui rendre son stock
    const articleOriginal = articles.find(a => a.id === articleARetirer.id);
    if (articleOriginal) {
        articleOriginal.stock++;
    }

    // 3. Supprimer du tableau panier
    panier.splice(index, 1);

    // 4. Tout rafraîchir
    mettreAJourBadgePanier();
    afficherContenuPanier();
    afficherProduitsAccueil(); // Le stock remonte visuellement sur l'accueil
}


function ouvrirPanier() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'flex';
    afficherContenuPanier();
}

function fermerPanier() {
    document.getElementById('cart-modal').style.display = 'none';
}

function afficherContenuPanier() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total-price');
    
    if (!list || !totalEl) return;

    list.innerHTML = ""; // On vide la liste avant de reconstruire
    let total = 0;

    if (panier.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px;'>Votre panier est vide 🛒</p>";
    } else {
        panier.forEach((item, index) => {
            // On calcule le total au fur et à mesure
            total += parseFloat(item.prix);

            // On crée une ligne unique pour chaque article du panier
            list.innerHTML += `
                <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #2d3748;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: bold;">${item.nom}</span>
                        <span style="font-size: 0.9em; color: #f6ad55;">${item.prix} Pi</span>
                    </div>
                    <button onclick="retirerDuPanier(${index})" style="background: none; border: none; font-size: 20px; cursor: pointer;">
                        🗑️
                    </button>
                </div>
            `;
        });
    }
    
    // On affiche le total calculé
    totalEl.innerText = total;
}


function validerCommande() {
    if (panier.length === 0) {
        alert("Votre panier est vide !");
        return;
    }
    
    const total = document.getElementById('cart-total-price').innerText;
    alert(`Commande de ${total} Pi validée ! Merci de votre confiance chez Double King Shop.`);
    
    // On vide le panier après la commande
    panier = [];
    mettreAJourBadgePanier();
    fermerPanier();
}
// Dans ta boucle d'affichage...
const stockColor = item.stock > 0 ? "#48bb78" : "#f56565"; // Vert si dispo, rouge si vide
const btnDisabled = item.stock > 0 ? "" : "disabled style='opacity:0.5; cursor:not-allowed;'";

grid.innerHTML += `
    <div class="product-card">
        ...
        <p class="stock" style="color: ${stockColor}">
            ${item.stock > 0 ? `En stock: ${item.stock}` : "Rupture de stock"}
        </p>
        <button class="add-to-cart-btn" onclick="ajouterAuPanier(${item.id})" ${btnDisabled}>
            ${item.stock > 0 ? "🛒 Ajouter" : "Épuisé"}
        </button>
    </div>
`;
let historiqueVentes = []; // Tableau pour stocker les ventes réussies

function validerVente() {
    if (panier.length === 0) return;

    let totalVente = 0;
    let articlesVendus = [];

    panier.forEach(item => {
        totalVente += parseFloat(item.prix);
        articlesVendus.push(item.nom);
    });

    const confirmation = confirm(`Confirmer la vente de ${totalVente} Pi ?`);

    if (confirmation) {
        // --- NOUVEAU : Enregistrement dans l'historique ---
        const nouvelleVente = {
            date: new Date().toLocaleString(),
            articles: articlesVendus.join(", "),
            total: totalVente
        };
        historiqueVentes.push(nouvelleVente);
        // --------------------------------------------------

        alert(`✅ Vente validée ! Total : ${totalVente} Pi`);
        
        panier = [];
        mettreAJourBadgePanier();
        fermerPanier();
        afficherProduitsAccueil();
        
        console.log("Historique des ventes :", historiqueVentes);
    }
}
function filtrerProduits() {
    // 1. Récupérer le texte tapé (en minuscule pour ne pas avoir de soucis de majuscules)
    const recherche = document.getElementById('search-input').value.toLowerCase();
    
    // 2. Filtrer le tableau articles
    const articlesFiltres = articles.filter(item => {
        return item.nom.toLowerCase().includes(recherche);
    });

    // 3. Afficher uniquement les articles qui correspondent
    afficherProduitsAccueil(articlesFiltres);
}
function filtrerParCategorie(nomCategorie) {
    // 1. Gérer le bouton "Tout voir"
    if (nomCategorie === "Tout") {
        afficherProduitsAccueil(articles);
    } else {
        // 2. Filtrer les articles qui correspondent à la catégorie
        const filtres = articles.filter(item => item.categorie === nomCategorie);
        afficherProduitsAccueil(filtres);
    }

    // 3. (Optionnel) Changer le style des boutons pour montrer lequel est actif
    const boutons = document.querySelectorAll('.filter-chip');
    boutons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.includes(nomCategorie) || (nomCategorie === "Tout" && btn.innerText === "Tout voir")) {
            btn.classList.add('active');
        }
    });
}
async function payerEnPi() {
    if (panier.length === 0) return alert("Panier vide !");

    // Calcul du montant total
    let totalAmount = 0;
    panier.forEach(item => totalAmount += parseFloat(item.prix));

    try {
        const payment = await Pi.createPayment({
            amount: totalAmount,
            memo: "Achat d'accessoires sur Double King Shop 👑",
            metadata: { cart: panier.map(i => i.nom).join(", ") },
        }, {
            // Étape 1 : Le serveur Pi a créé le paiement
            onReadyForServerApproval: (paymentId) => {
                console.log("Paiement prêt pour approbation serveur :", paymentId);
                // Ici, normalement, ton backend approuve. 
                // Pour le test, on simule l'étape suivante.
            },
            // Étape 2 : L'utilisateur a payé sur son application Pi Wallet
            onReadyForServerCompletion: (paymentId, txid) => {
                console.log("Paiement effectué ! TXID :", txid);
                finaliserVenteApresPaiement(txid);
            },
            // Étape 3 : Annulation par l'utilisateur
            onCancel: (paymentId) => {
                alert("Paiement annulé.");
            },
            // Étape 4 : Erreur
            onError: (error, payment) => {
                console.error("Erreur Pi Pay :", error);
                alert("Une erreur est survenue lors du paiement.");
            },
        });
    } catch (err) {
        alert("Erreur d'initialisation du paiement.");
    }
}

function finaliserVenteApresPaiement(transactionId) {
    const receiptModal = document.getElementById('receipt-modal');
    const detailsDiv = document.getElementById('receipt-details');
    const txidPara = document.getElementById('receipt-txid');
    
    let contenuReceipt = "";
    let total = 0;
    
    panier.forEach(item => {
        total += parseFloat(item.prix);
        contenuReceipt += `<div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
            <span style="color: #2d3748;">${item.nom}</span> 
            <span style="font-weight: bold; color: #623686;">${item.prix} π</span>
        </div>`;
    });

    const date = new Date().toLocaleString();
    detailsDiv.innerHTML = `
        <p style="color: #718096; margin-bottom: 10px;">Date: ${date}</p>
        ${contenuReceipt}
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:18px; margin-top: 15px; color: #623686; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            <span>TOTAL PAYÉ:</span> <span>${total} π</span>
        </div>
    `;
    
    txidPara.innerText = transactionId;

    // Affichage
    receiptModal.style.display = 'flex';
    
    // Nettoyage
    panier = [];
    mettreAJourBadgePanier();
    fermerPanier();
    afficherProduitsAccueil();
}
function partagerSurPiChat() {
    const message = "Je viens de faire un achat sur Double King Shop avec mes Pi ! 👑💎 #PiNetwork #DoubleKingShop";
    // Le SDK Pi permet d'ouvrir le chat ou de partager du contenu
    Pi.openShareDialog("Achat réussi !", message);
}
function ouvrirMenu() {
    console.log("Ouverture du menu...");
    document.getElementById('side-menu').style.left = "0";
}

function fermerMenu() {
    console.log("Fermeture du menu...");
    document.getElementById('side-menu').style.left = "-250px";
}
function chargerTousLesProduits() {
    // Tes produits par défaut
    const produitsParDefaut = [
        { id: 1, nom: "Clavier", prix: 25, image: "images/clavier.png" },
        // ... tes autres produits générés ...
    ];

    // Récupérer les produits ajoutés par l'admin
    const produitsAdmin = JSON.parse(localStorage.getItem('mesProduits')) || [];

    // Fusionner les deux listes
    const catalogueComplet = [...produitsParDefaut, ...produitsAdmin];

    // Utilise maintenant 'catalogueComplet' pour afficher tes cartes sur l'accueil
    afficherProduits(catalogueComplet);
}




