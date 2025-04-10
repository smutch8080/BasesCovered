# Softball Practice Planner

A comprehensive web application for planning and managing softball practices, built with React, Firebase, and TypeScript.

## Features

- User authentication (Email, Google, Apple, Phone)
- Team management
- Practice planning and scheduling
- Drill library
- Real-time notifications
- Role-based access control
- Mobile-responsive design

## Tech Stack

- React 18
- TypeScript
- Firebase (Auth, Firestore, Storage, Functions)
- Vite
- Tailwind CSS
- Lucide Icons

## Prerequisites

- Node.js 16+
- npm or yarn
- Firebase project with required services enabled

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
VITE_FIREBASE_REGION=your_region
VITE_FIREBASE_FUNCTIONS_URL=your_functions_url
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/softball-practice-planner.git
cd softball-practice-planner
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Building for Production

```bash
npm run build
# or
yarn build
```

## Firebase Setup

1. Create a new Firebase project
2. Enable Authentication methods (Email, Google, Apple, Phone)
3. Set up Firestore database
4. Configure Storage rules
5. Deploy Firebase Functions
6. Add authorized domains in Firebase Console

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/softball-practice-planner](https://github.com/yourusername/softball-practice-planner) 