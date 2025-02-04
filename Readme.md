# YouTube-Like Backend

A minimal backend for a YouTube-like platform with user authentication, video management, and subscription handling.

## Features

- User authentication (JWT, refresh tokens)
- Video upload & management
- User subscriptions
- Watch history

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (Access & Refresh Tokens)

## Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Aniketbhandari18/Backend.git  
   cd Backend  
   ```
2. Install dependencies
   ```sh
   npm install  
   ```
3. Create a `.env` file with:
   ```env
   ACCESS_TOKEN_SECRET=your_secret  
   REFRESH_TOKEN_SECRET=your_secret  
   MONGO_URI=your_mongodb_uri  
   ```
4. Run the server
   ```sh
   npm run dev 
   ```

