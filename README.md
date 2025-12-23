# DistroCouple 🚀

DistroCouple is a modern desktop application built with **Electron**, **React**, and **Vite**. It leverages **Firebase** for backend services and provides a sleek interface for system monitoring and interaction.

## ✨ Features

- **Modern UI**: Built with React and Framer Motion for smooth animations.
- **System Information**: Real-time system monitoring using `systeminformation`.
- **Firebase Integration**: Secure backend connection for data synchronization.
- **Vite Powered**: Ultra-fast development and build process.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/miracthedevv/DistroCouple.git
   cd DistroCouple
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Configure Firebase:
   - Create a `src/renderer/firebase.ts` file.
   - Add your Firebase configuration keys (this file is ignored by Git for security).

### Development

Run the development server:
```bash
npm run dev
# and in another terminal
npm run electron:dev
```

### Build

To package the application:
```bash
npm run build
```

## 📂 Project Structure

- `src/main`: Electron main process files.
- `src/renderer`: React frontend components and styles.
- `public`: Static assets.

## 📄 License

This project is licensed under the ISC License.
