# 🎂 Interactive Birthday Cake Diorama

A lightweight, creative single-page web experience featuring a 3D chocolate cake built with Three.js, a custom retro emoji frame, and an engaging button-chase interaction.

## 🚀 Live Link
👉 [Interact with the Live Site Here](https://delicate-kitten-59739c.netlify.app)

---

## 🎁 Dynamic Personalization Feature

This project utilizes native JavaScript `URLSearchParams` to allow anyone to personalize the birthday wish dynamically without needing a database or a backend server. 

### How to use it:
Simply append `?name=TheirName` to the end of the deployment URL. When the receiver opens the link and beats the 5-click chase game, the site reads the address bar parameters and outputs a personalized capitalised greeting!

* **Standard Default Link:** `https://delicate-kitten-59739c.netlify.app` (Outputs: "HAPPY BIRTHDAY!!")
* **Personalized Gift Link:** `https://delicate-kitten-59739c.netlify.app/?name=Leon` (Outputs: "HAPPY BIRTHDAY, LEON!!")

---

## 🛠️ Project Architecture

```text
cake/
├── index.html         # Document markup & overlay wrappers
├── styles.css         # Retro emoji viewport frames & UI transitions
└── src/
    ├── main.js        # App orchestration core
    ├── scene.js       # Three.js engine, lighting, and camera setups
    ├── cake.js        # 3D modeling geometries for the ribbed cake
    ├── animation.js   # Rotation & continuous loop animations
    └── ui.js          # Click-chase logic, confetti, and URL query tracking
