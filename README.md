# Koyra-Paikgacha Community App

A comprehensive community application for Koyra and Paikgacha regions, providing various digital services including:
- Digital Ledger (Personal Finance Tracking)
- Online Haat (Marketplace)
- Weather Information
- Community Chat
- Hotline Directory
- Medical Information
- And more...

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Motion
- **Backend:** Express.js (Custom Server)
- **Database:** Firebase (Firestore & Realtime Database)
- **Other Tools:** html2canvas, jspdf (for report generation), nodemailer (for emails)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd koyra-paikgacha
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required API keys and credentials

### Running the App
- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Preview Production Build:**
  ```bash
  npm run preview
  ```

## Firebase Configuration
This project uses multiple Firebase projects for different modules (e.g., App Settings, Digital Ledger, Chat, etc.). 
- The main configuration is in `firebase.ts`.
- Module-specific configurations are in `Firebase-*.ts` files.
For a production deployment, you may want to consolidate these into a single Firebase project or ensure all environment variables are correctly set for each module.

- `/src`: Frontend source code
- `/components`: Reusable UI components
- `/pages`: Application pages
- `server.ts`: Express server entry point
- `Firebase-*.ts`: Firebase configuration files for different modules

## License
This project is private. All rights reserved.

## Development by
**Intelligence Creation BD**
