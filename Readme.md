# YouTube-Like Backend

A minimal backend for a YouTube-like platform with user authentication, video management, and subscription handling.

## Features

- User authentication (JWT, refresh tokens)
- Video upload & management
- User subscriptions
- Watch history
- Commenting on videos
- Video engagement (like/dislike)
- Search functionality
- View count increment
- Password reset functionality

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (Access & Refresh Tokens)
- **File Uploads:** Multer, Cloudinary
- **Email:** Nodemailer

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
   PORT=8000
   MONGODB_URI=your_mongodb_uri
   ACCESS_TOKEN_SECRET=your_secret  
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_secret  
   REFRESH_TOKEN_EXPIRY=10d
   VERIFICATION_TOKEN_SECRET=your_secret
   VERIFICATION_TOKEN_EXPIRY=1h
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   CLIENT_URL=http://localhost:8000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Run the server
   ```sh
   npm run dev 
   ```

## API Endpoints

### User Routes

- `POST /api/v1/user/register` - Register a new user
- `POST /api/v1/user/verify` - Verify a user's email
- `POST /api/v1/user/forgot-password` - Request password reset
- `POST /api/v1/user/reset-password/:resetPasswordToken` - Reset password
- `POST /api/v1/user/login` - Login a user
- `POST /api/v1/user/logout` - Logout a user
- `POST /api/v1/user/refresh-token` - Refresh access token
- `PATCH /api/v1/user/edit-profile` - Edit user profile
- `DELETE /api/v1/user/delete-profile` - Delete user profile
- `GET /api/v1/user/:username` - Get user profile details

### Video Routes

- `GET /api/v1/video/homeVideos` - Get home videos
- `GET /api/v1/video/results` - Get search results
- `GET /api/v1/video/:videoId` - Get video by ID
- `POST /api/v1/video/publish` - Publish a new video
- `PATCH /api/v1/video/update/:videoId` - Update video details
- `DELETE /api/v1/video/:videoId` - Delete a video
- `POST /api/v1/video/incrementView/:videoId` - Increment view count

### Engagement Routes

- `POST /api/v1/engagement/handleEngagement/:videoId` - Handle video engagement (like/dislike)
- `GET /api/v1/engagement` - Get liked videos

### Subscription Routes

- `POST /api/v1/subscription/c/:channelId` - Subscribe/Unsubscribe to a channel
- `GET /api/v1/subscription` - Get subscribed channels

### Comment Routes

- `POST /api/v1/comment/:videoId` - Add a comment to a video
- `PATCH /api/v1/comment/edit/:commentId` - Edit a comment
- `DELETE /api/v1/comment/delete/:commentId` - Delete a comment
- `GET /api/v1/comment/:videoId` - Get comments for a video

### Watch History Routes

- `POST /api/v1/watchHistory/:videoId` - Add a video to watch history
- `DELETE /api/v1/watchHistory/remove/:watchHistoryId` - Remove a video from watch history
- `DELETE /api/v1/watchHistory/clear` - Clear watch history
- `GET /api/v1/watchHistory` - Get watch history

## License

This project is licensed under the ISC License.