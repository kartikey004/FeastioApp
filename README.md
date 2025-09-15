# Feastio: Smart Meal Planner

Frontend application for **Feastio: Smart Meal Planner**, built with **Expo** and **React Native**, providing a seamless mobile experience for users.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup and Installation](#setup-and-installation)
- [Running the App](#running-the-app)
- [Contact](#contact)

---

## Overview

FeastioApp is the cross-platform mobile frontend for the Feastio platform, built using **React Native** and **Expo**, with a backend powered by **Node.js**, **Express.js**, and **MongoDB**, and additional services via **Firebase**.  

The app provides an AI-driven 7-day meal planning experience, offering users:  

- Complete meal plans with ingredients, cooking times, and detailed macronutrient breakdowns.  
- Integration with the **Gemini API** for a conversational health and fitness assistant.  
- Daily engagement features, including auto-refreshing nutrition tips (5 new tips every 10 seconds).  
- Adaptive personalization based on diet preferences, allergies, and activity levels to ensure tailored recommendations.  
- A dedicated **Menstrual Health** preferences section (Regular, Irregular, PCOS, Menopause) for female users, enabling inclusive and context-aware meal planning.  
- Secure user access via **OTP email verification** using Nodemailer.  

FeastioApp delivers a comprehensive, user-centric experience for managing nutrition, health, and wellness through AI-driven guidance and personalized meal recommendations.


---

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: JavaScript / TypeScript
- **State Management**: Redux
- **Navigation**: React Navigation
- **API Client**: Axios or Fetch
---

## Folder Structure

```bash
FeastioApp/
├── .vscode/           # VSCode workspace settings
├── api/               # API service layer
├── app/               # Main app entry point
├── assets/            # Images, fonts, and other static assets
├── components/        # Reusable UI components
├── constants/         # Constant values and configurations
├── hooks/             # Custom React hooks
├── redux/             # Redux store and reducers
├── scripts/           # Utility scripts
├── utils/             # Helper functions
├── .gitignore         # Git ignore rules
├── app.config.js      # Expo app configuration
├── declaration.d.ts   # TypeScript declarations
├── eas.json           # Expo Application Services configuration
├── eslint.config.js   # ESLint configuration
├── package.json       # Project metadata and dependencies
├── pnpm-lock.yaml     # pnpm lock file
├── pnpm-workspace.yaml# pnpm workspace configuration
├── tsconfig.json      # TypeScript configuration (if applicable)
└── README.md          # Project documentation
```
---

## Setup and Installation

Clone the repository:

```bash
git clone https://github.com/kartikey004/FeastioApp.git
cd FeastioApp
```
---

## Running the App

For development:

```bash
npx expo start


# Using pnpm
pnpm install

# Or using npm
npm install
```

For production:

```bash
npx expo build:android
npx expo build:ios
```

## Contact

For any questions, issues, or suggestions regarding this project, you can reach out to:

- **Name**: Kartikey  
- **Email**: kartikeym004@gmail.com
- **GitHub**: [https://github.com/kartikey004](https://github.com/kartikey004)
