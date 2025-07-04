# Nuroo App

**Nuroo** is a mobile companion app designed to support parents of neurodivergent children by offering personalized, AI-driven learning experiences and progress tracking.

Built with ❤️ by [Manavolt](https://github.com/manavolt-dev) — a studio dedicated to building meaningful tech for impactful communities.

---

##  Overview

Nuroo empowers parents by:

- Delivering personalized educational tasks powered by AI  
- Tracking emotional and cognitive progress  
- Supporting accessible, friendly design for families  
- Making learning collaborative between child, parent, and technology  

---

##  Key Features

- ✨ AI-Generated Activities tailored to your child’s learning needs  
- 📊 Progress Dashboard to visualize growth over time  
- 🧩 Adaptive UX for children with sensory needs  
- 🔒 Secure authentication & synced cloud storage  
- 🌐 Multilingual (initially English + Russian)  

---

##  Tech Stack

| Layer      | Tech                              |
|------------|----------------------------------|
| Frontend   | React Native (Expo)               |
| Backend    | Firebase (Auth, Firestore, Storage) |
| AI         | OpenAI API (for generating content) |
| Auth       | Firebase Auth       |
| Analytics  | Firebase Analytics / PostHog (TBD) |
| Deployment | Expo / EAS                       |

---

## 📁 Folder Structure (Planned)

| Path          | Description                   |
|---------------|-------------------------------|
| assets/       | Icons, images, sounds          |
| app/          | App root                      |
| components/   | Shared UI components           |
| screens/      | App screens                    |
| services/     | Firebase, API wrappers         |
| utils/        | Helpers, constants             |
| hooks/        | Custom React hooks             |
| navigation/   | Navigation config              |
| i18n/         | Internationalization           |



---

##  Getting Started

> **Note:** This is still under active development.

### 1. Clone the repository

```bash
git clone https://github.com/manavolt-dev/nuroo-app.git
cd nuroo-app
```


### 2. Install dependencies

```bash
npm install
```

### 3. Start development server
```bash
npx expo start
```

## Security & Privacy

Nuroo is committed to user privacy and safe data handling. Sensitive data is never stored unencrypted, and we comply with the highest standards in ethical tech.

## Contributing

We're still early in development, but we welcome contributions and feedback from educators, designers, developers, and parents.
To join the team or collaborate - please email me at tilek.dzenisev@gmail.com.

## License

© 2025 Manavolt. All rights reserved.

This repository is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
