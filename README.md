# PWA Messenger - BEN

Application de messagerie Progressive Web App (PWA) construite avec Next.js et TypeScript.

## 🚀 Fonctionnalités

- **Mode Offline** : Consultation des conversations et pièces jointes hors ligne
- **Profil utilisateur** : Création/modification du pseudo et photo de profil
- **Messagerie** : Création et participation à des salles de chat
- **Caméra** : Prise de photos directement dans l'application
- **Notifications** : Alertes lors de l'envoi de photos
- **Stockage local** : Persistance des données avec LocalStorage

## 📋 Prérequis

- **Docker** et **Docker Compose** installés
- Ou **Node.js 20+** et **npm** pour une installation locale

## 🛠️ Installation

### Option 1 : Avec Docker (Recommandé)

#### Développement (avec hot-reload)
```bash
make dev
```

#### Production
```bash
make prod
```

#### Commandes Makefile disponibles
```bash
make help        # Afficher toutes les commandes
make dev         # Démarrer en mode développement
make prod        # Démarrer en mode production
make stop        # Arrêter tous les conteneurs
make logs        # Voir les logs
make build-dev   # Rebuild l'image de dev
make build-prod  # Rebuild l'image de prod
```

### Option 2 : Installation locale

```bash
# Installer les dépendances
npm install

# Développement
npm run dev

# Production
npm run build
npm start
```

## 🌐 Accès

L'application est accessible sur **http://localhost:3010**

## 📝 License

Projet réalisé dans le cadre du TP PWA - MDS
