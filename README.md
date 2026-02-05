# FlowMinds

> **AI-Powered System Architecture & Logic Flow Visualizer**

![FlowMinds Badge](https://img.shields.io/badge/Status-Operational-06b6d4?style=for-the-badge&logo=angular)
![License](https://img.shields.io/badge/License-MIT-zinc?style=for-the-badge)

FlowMinds is a next-generation diagramming tool wrapped in a stunning **Cyberpunk/Sci-Fi interface**. It leverages AI to transform natural language descriptions into complex execution flows, system architectures, and logic diagrams using Mermaid.js.

Simply type your logic into the **Neural Link Input**, execute the protocol, and watch your thoughts materialize into structured diagrams instantly.

---

## 📸 Interface

![Dashboard Preview](./docs/screenshots/dashboard-preview.png)
*(Note: Screenshot to be added. The interface features a split-pane design with a glowing cyan terminal on the left and a reactive diagram canvas on the right.)*

---

## 🚀 Features

-   **Cyberpunk Functionality**: Immersive UI with neon aesthetics, glassmorphism, and micro-interactions.
-   **AI-Driven Generation**: Converts text prompts like "Login flow with 2FA" into accurate Mermaid diagrams.
-   **Interactive Canvas**:
    -   **Pan & Zoom**: Navigate large diagrams with ease.
    -   **Auto-fit**: Diagrams automatically scale to fit the viewport.
    -   **Centering**: Smart positioning for optimal visibility.
-   **Responsive Design**: optimized for both Desktop (split view) and Mobile (stacked view).
-   **Toast Notifications**: Real-time status updates via a holographic notification system.

---

## 🛠️ Tech Stack

-   **Framework**: [Angular 19+](https://angular.io/) (Standalone Components)
-   **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
-   **Diagramming**: [Mermaid.js](https://mermaid.js.org/)
-   **Interactivity**: `svg-pan-zoom`
-   **Icons/UI**: `ngx-sonner` (Toaster)

---

## ⚡ Quick Start

### Prerequisites

-   Node.js v20+
-   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ranjithvaratharajan/flow-minds.git
    cd flow-minds
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    The app requires a connection to the Nexus Backend. By default, it looks for a local server.
    
    Update `src/environments/environment.ts` for local development:
    ```typescript
    export const environment = {
      production: false,
      apiUrl: 'http://localhost:3000/api'
    };
    ```

4.  **Run the application**
    ```bash
    npm start
    ```
    Navigate to `http://localhost:4200` to access the neural link.

---

## 🚢 Deployment

The project includes a GitHub Action for automatic deployment to Spaceship Shared Hosting via FTP.

### Configuration
Set the following secrets in your GitHub Repository:
- `FTP_SERVER`: Your FTP Host address
- `FTP_USERNAME`: Your FTP User
- `FTP_PASSWORD`: Your FTP Password

The workflow automatically builds the Angular app and syncs it to the server on every push to `main`.

---

## 🤝 Contributing

Protocol: **OPEN**.
Pull requests are welcome. For major changes, please open an issue first to discuss the architecture changes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<p align="center">
  <span style="color: #06b6d4; font-family: monospace;">> END OF TRANSMISSION</span>
</p>
