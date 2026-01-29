# 📱 PWA Messenger - GeoChat

Une Progressive Web App (PWA) de messagerie instantanée moderne, permettant la discussion en temps réel, le partage de photos et la géolocalisation sur carte interactive. Construit avec **Next.js**, **Socket.IO** et **React Leaflet**.

![Status](https://img.shields.io/badge/Status-Beta-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Fonctionnalités Principales

### 💬 Messagerie Temps Réel
- **Socket.IO** : Communication bidirectionnelle instantanée.
- **Salons (Rooms)** : Rejoignez ou créez des salons de discussion dynamiques.
- **Mises à jour optimistes** : L'interface réagit immédiatement à l'envoi des messages pour une fluidité maximale.

### 📍 Géolocalisation & Cartes
- **Partage de position** : Envoyez votre position GPS précise en un clic.
- **Cartes Interactives** : Visualisez les positions partagées directement dans le chat via une carte OpenStreetMap (Leaflet).
- **Format JSON** : Protocole d'échange de données structuré pour les coordonnées (`{"type":"geo", ...}`).

### 📸 Multimédia
- **Appareil Photo** : Module caméra intégré pour prendre des photos sans quitter l'app.
- **Upload d'Images** : Envoi d'images depuis la galerie.
- **Visualisation** : Mode "Lightbox" pour voir les images en grand écran.

### 🔌 Mode Hors Ligne (PWA)
- **Service Worker** : Mise en cache des ressources pour un chargement instantané.
- **Indicateur de connexion** : Détection automatique de l'état du réseau.
- **Manifest** : Installable sur mobile (iOS/Android) et Desktop comme une application native.

---

## 🛠️ Stack Technique

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript
- **Backend Realtime** : Serveur HTTP Node.js custom avec Socket.IO intégré à Next.js
- **UI/UX** : CSS Modules, Glassmorphism design, Responsive mobile-first
- **Maps** : React Leaflet, OpenStreetMap
- **Infrastructure** : Docker, Docker Compose, Make

---

## 🚀 Installation & Démarrage

### Prérequis
- **Docker** et **Docker Compose** (Recommandé)
- Ou **Node.js 20+** pour une exécution locale

### Option 1 : Via Docker (Recommandé)

Le projet inclut un `Makefile` pour simplifier les commandes Docker.

```bash
# Démarrer en mode développement (avec hot-reload)
make dev

# Démarrer en mode production (optimisé)
make prod

# Voir les logs
make logs

# Arrêter les conteneurs
make stop
```

L'application sera accessible sur **http://localhost:3010**.

### Option 2 : Installation Locale (npm)

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
# Accessible sur http://localhost:3000

# Builder et lancer en production
npm run build
npm start
```

---

## 📂 Structure du Projet

```
.
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── reception/      # Page d'accueil (choix du pseudo/room)
│   │   ├── room/[id]/      # Interface de chat (MessageList, Input, Map)
│   │   └── api/            # API Routes (Socket.IO injection)
│   ├── components/         # Composants Réutilisables
│   │   ├── CameraCapture   # Module caméra plein écran
│   │   ├── LocationMap     # Carte Leaflet (Dynamic import)
│   │   └── ...
│   ├── lib/
│   │   ├── socket.ts       # Client Socket.IO singleton
│   │   ├── storage.ts      # Gestion du LocalStorage (User/Rooms)
│   │   └── types.ts        # Définitions TypeScript partagées
│   └── server.ts           # Custom Server pour Socket.IO + Next.js
├── public/                 # Assets statiques (icons, manifest)
├── Dockerfile              # Configuration de l'image Docker
├── compose.yml             # Orchestration Docker
└── Makefile                # Raccourcis commandes
```

## ⚙️ Configuration & Ports

- **Port Application** : `3010` (mappé via Docker) ou `3000` (npm dev par défaut).
- **Socket.IO** : Écoute sur le même port que le serveur HTTP principal.

## 📱 PWA & Mobile

Pour installer l'application sur mobile :
1. Ouvrez l'URL dans Chrome (Android) ou Safari (iOS).
2. Appuyez sur **"Ajouter à l'écran d'accueil"**.
3. L'application se lance en plein écran sans barres de navigateur.

---
*Projet réalisé dans le cadre du module Développement Frontend Avancé.*

