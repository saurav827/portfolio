# Saurav Kumar | Premium Developer Portfolio & AI Sandbox

This repository contains the premium, industry-level developer portfolio and showcase for **Saurav Kumar**, specializing as an AI Engineer, Machine Learning Developer, and Full Stack Developer.

The application showcases his education details, skills, certifications, dynamic GitHub integrations, and interactive case study presentations.

---

## 📂 Folder Structure

```text
portfolio/
│
├── assets/
│   ├── images/          # Profile pictures and project assets
│   ├── icons/           # Technical icon badges
│   ├── resume/          # Saurav Kumar's PDF Resume
│
├── css/
│   ├── style.css        # Main stylesheet (Glassmorphism design system)
│   ├── animations.css   # Scroll reveal and micro-interaction keyframes
│
├── js/
│   ├── main.js          # Core page UI interactions & typing effects
│   ├── animations.js    # IntersectionObserver scroll reveal controller
│   ├── github.js        # GitHub REST API dynamic statistics module
│
├── projects/
│   ├── fake-news-detection/ # Case study for Fake News Detection System
│   ├── loan-approval/       # Case study for Loan Approval Prediction
│   ├── ai-chatbot/          # Case study for Conversational AI Chatbot
│
├── index.html           # Main Entry Landing Page
└── README.md            # Repository documentation
```

---

## 🛠️ Technologies & Features

1. **Vanilla HTML5 & CSS3**: Solid responsive grids, semantic outlines, and cross-device scaling.
2. **Glassmorphism Theme System**: Modern dark-mode by default, sleek backdrop-filter blur accents, and glowing card borders.
3. **GSAP Animations**: Fluid entry transitions, float effects, and interactive sequences.
4. **Dynamic GitHub Sync**: Queries the GitHub API to render real-time statistics (followers, public repos, and a recent repositories grid feed) with error fallback state controls and a mock commitment activity tracker grid.
5. **SEO Optimization**: Structured headers, meta tags, OpenGraph metadata, and accessibility compliance.

---

## 🚀 Deployment Instructions

### 🌟 1. Vercel (Recommended)
Vercel is the recommended hosting platform for this portfolio due to its instant zero-config deployments, global edge networks, and automatic branch previews.

1. **Sign Up / Login**: Navigate to [Vercel](https://vercel.com) and log in using your GitHub account.
2. **Import Repository**: Click **Add New** > **Project**, select your portfolio repository, and click **Import**.
3. **Configure Project**:
   - **Framework Preset**: Select **Other**.
   - **Root Directory**: Select `./` (project root).
   - **Build and Development Settings**: Leave as default (this is a static project, no compilation is required).
4. **Deploy**: Click **Deploy**. Vercel will build and host your portfolio on a secure `https` domain in under a minute.

### ⚡ 2. Netlify
Netlify offers excellent git-based build triggers and manual drag-and-drop deployments.

1. **Sign Up / Login**: Log in to [Netlify](https://netlify.com) using your GitHub account.
2. **Add New Site**: Click **Add new site** > **Import an existing project**.
3. **Select Git Provider**: Choose **GitHub** and authorize Netlify to access your repository.
4. **Configure Site**: Choose your main branch and leave the build command and publish directory empty (or set publish directory to `.` or root).
5. **Deploy**: Click **Deploy site**.

### 💻 3. GitHub Pages
GitHub Pages provides free static hosting directly from your repository settings.

1. **Push Code**: Ensure all final production code is pushed to your main branch on GitHub.
2. **Configure Settings**: Navigate to your repository on GitHub, and click **Settings**.
3. **Configure Pages**: Scroll down the left sidebar to **Pages**:
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Under **Branch**, select `main` and directory `/ (root)`.
4. **Save**: Click **Save**.
5. **Access Site**: Within 1-2 minutes, GitHub will publish your portfolio at `https://<your-username>.github.io/<repository-name>/`.
