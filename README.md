
# 🎹 DreamLand Piano

## 🌌 Plongez dans un rêve musical

Vous vous retrouvez dans un rêve froid et obscur. Au centre, une île flottante et un mystérieux piano. Est-il la clé pour réchauffer ce rêve et révéler ses secrets ?
(Pour passer de qwerty vers azerty -> touche Y)

👉 [Jouer maintenant](https://www.moustik.dev)

Demo du jeu ! (image cliquable)
[![Démonstration DreamLand Piano](https://img.youtube.com/vi/8eci-H-L4Xc/maxresdefault.jpg)](https://www.youtube.com/watch?v=8eci-H-L4Xc)


---

## ✨ Fonctionnalités principales

* **Piano interactif** : Jouez des notes simples ou en accords via une interface intuitive.
* **Tutoriel guidé** : Un tutoriel vous accompagne pour découvrir les premières transformations.
* **Composition musicale** : Enregistrez et rejouez vos créations.
* **Environnement 3D évolutif** : Un monde qui se transforme en fonction de vos progrès.
* **Feedback visuel** : Les touches s'illuminent pour vous guider.

---

## 🛠️ Technologies utilisées

| Composant               | Technologie          | Rôle                                                |
| ----------------------- | -------------------- | --------------------------------------------------- |
| Moteur 3D               | Babylon.js           | Rendu 3D, gestion des scènes, chargement des assets |
| Physique                | Havok Physics        | Détection des collisions, mouvements du joueur      |
| Audio                   | Tone.js              | Synthèse sonore, lecture musicale                   |
| Développement           | Vite + TypeScript    | Environnement de développement moderne              |
| Modélisation 3D         | Blender              | Création du monde et des assets 3D                  |
| Textures                | Substance 3D Painter | Création des textures détaillées                    |
| Gestion des dépendances | npm                  | Installation et gestion des packages                |

---

## 🧠 Architecture du projet

Le projet est structuré autour d'une architecture modulaire et événementielle :

* **Système de piano** : Gère l'interaction avec le piano, supporte les notes simples et les accords.
* **Système d'aide** : Comprend le tutoriel et le feedback visuel.
* **Système musical** : Permet l'enregistrement et la lecture en temps réel.
* **Monde 3D** : Un environnement qui évolue en fonction des interactions musicales du joueur.
* **Gestion des événements** : Communication entre les différents modules via un bus d'événements centralisé.

Pour plus de détails, consultez la documentation complète sur [DeepWiki](https://deepwiki.com/Moustik06/gow-dreamland/1-overview).

(Attention : la documentation a été générée automatiquement par IA. Elle contient des erreurs surtout liés au contexte et objectifs.)

---

## 🚀 Lancer le projet en local

1. Clonez le dépôt GitHub :

   ```bash
   git clone https://github.com/gamesonweb/dreamland-Moustik06.git
   ```
2. Installez les dépendances :

   ```bash
   npm install
   ```
3. Lancez le serveur de développement :

   ```bash
   npm run dev
   ```
4. Ouvrez votre navigateur à l'adresse indiquée (par défaut : [http://localhost:5173](http://localhost:5173)).

---

## 🙌 Crédits

Développé par **Quentin Escobar** (M2 - MBDS).
