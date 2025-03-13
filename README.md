 `README.md`

Use the project documentation we created earlier.

## Deployment Steps

### 1. Set Up GitHub Repository

1. Create a new repository on GitHub (e.g., `padel-tournament-app`)
2. Initialize a local Git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/padel-tournament-app.git
   git push -u origin main
   ```

### 2. Deploy to Vercel

#### Option 1: Using Vercel Dashboard (Recommended for beginners)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "New Project"
3. Import your GitHub repository
4. Keep the default settings and click "Deploy"
5. Once deployed, you'll get a URL that you can access from your iPhone

#### Option 2: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy the project:
   ```bash
   vercel
   ```

3. Follow the prompts to log in and configure your project

### 3. Add to iPhone Home Screen

For the best mobile experience, add the web app to your iPhone home screen:

1. Open the Vercel URL in Safari on your iPhone
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Padel Tournament" and tap "Add"

This creates an app icon on your home screen that opens the web app in full-screen mode, making it feel more like a native app.

## Additional Tips for iOS Usage

1. **Prevent Zooming**: The app includes settings to prevent unwanted zooming when tapping buttons
2. **Fullscreen Mode**: Adding to home screen removes Safari UI elements for a better experience
3. **Offline Access**: Once loaded, the app should work without internet connection for the duration of the tournament
4. **Screen Timeout**: Consider changing your iPhone's auto-lock settings to prevent the screen from turning off during the tournament

## Troubleshooting

If you encounter issues during deployment:

1. **Build Errors**: Check the Vercel build logs for specific error messages
2. **Blank Screen**: Open browser dev tools to check for JavaScript errors
3. **Styling Issues**: Verify that Tailwind CSS is properly configured
4. **Mobile Layout Problems**: Test on different devices using browser dev tools

## Local Development

Before deploying, you can test the app locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser