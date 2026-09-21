Phase 1: Foundation & Architecture
The goal of this phase was to set up the basic skeleton of the application.

What we did in the Backend (Node.js & Express):

Server Setup: We created a basic Express web server to listen for incoming requests.

Database Connection: We connected the server to MongoDB using Mongoose, allowing us to store and retrieve data permanently.

Environment Variables: We set up a .env file to securely hide sensitive information like our database passwords and secret keys.

What we did in the Frontend (React.js):

App Creation: We initialized a new React application.

Routing: We installed React Router to handle page navigation (so users can click from the Home page to the Profile page without the browser reloading).

Global Layout: We created the basic visual layout: a fixed sidebar for navigation, a top header, and an empty space at the bottom where the music player would eventually go.

Phase 2: Database Design & Core Data
The goal here was to define what our data looks like and how to manipulate it.

What we did in the Backend:

User Model: We created a Mongoose Schema for Users. It tells the database that every user must have a name, email, password, a role (admin or user), and an array to hold their "liked" songs.

Song Model: We created a Schema for Songs. It requires a title, artist, genre, duration, and file paths for where the audio and cover images are stored.

Basic APIs: We wrote the initial controller functions to fetch all songs from the database and send them to the frontend as JSON data.

What we did in the Frontend:

Song Cards: We built a reusable SongCard UI component to display the song's cover image, title, and artist.

Home Page Grids: We set up the Home page to fetch the song data from our backend and map over it, displaying rows of Song Cards for different categories.

Phase 3: Security & Authentication
The goal was to allow users to securely register, log in, and protect certain pages.

What we did in the Backend:

Password Encryption: We used a library called bcryptjs to scramble user passwords before saving them to the database. If the database is ever hacked, the passwords remain unreadable.

JWT Generation: When a user logs in successfully, we generate a JSON Web Token (JWT). This is like a digital VIP wristband that proves who the user is.

Protection Middleware: We wrote a security checkpoint (middleware) that checks for this JWT wristband. If a user tries to access a protected route without it, the backend blocks them.

What we did in the Frontend:

Auth Context: We built a global AuthContext to remember if the user is currently logged in across the entire app.

Login/Register UI: We built the forms where users type their email and password, and connected them to our backend API.

Protected Routes: We wrapped certain pages (like the Profile or Liked Songs page) in a special component that automatically redirects unauthenticated users back to the login screen.

Phase 4: Media Handling & The Music Player
The goal was to make the app actually play music and allow admins to upload new tracks.

What we did in the Backend:

Multer Integration: We configured Multer to handle incoming file uploads. When an admin submits a new song, Multer grabs the MP3 file and the JPG image and saves them to a local uploads folder on the server.

Static Serving: We told Express to make the uploads folder public so the frontend can access those images and audio files via a URL.

Like/Unlike Logic: We built the API route that takes a songId and adds it to the user's likedSongs array in the database (or removes it if they already liked it).

What we did in the Frontend:

Global Player Context: We built a PlayerContext to hold the currently playing song. This ensures that if you start playing a song and navigate to a different page, the music doesn't stop.

Admin Dashboard: We created a hidden page just for admins with a form to type in song details, attach MP3/JPG files, and send them to the Multer backend.

Heart Icons: We added clickable heart icons to the Song Cards that trigger the Like/Unlike backend route and instantly turn green when clicked.

Phase 5: Artificial Intelligence (Groq & Qwen)
The goal was to make the app smart using cutting-edge Generative AI.

What we did in the Backend:

Groq SDK: We installed the Groq SDK and connected our API key to access the lightning-fast qwen3.8-27b model.

Chatbot Route: We created an endpoint that takes a user's typed message, adds a hidden system prompt instructing the AI to act like "MR.Alok the DJ," and returns the AI's response.

Search Typo-Fixer: We intercepted the normal search API. If a user searches for a song and the database finds 0 results, we secretly send the typo to the AI, ask it to fix the spelling, and search the database again with the corrected word.

What we did in the Frontend:

Chatbot UI: We built a floating chat window that users can open at any time to talk to MR.Alok for song recommendations.

Magic Namer: We added a "Magic Wand" button on the playlist creation screen that asks the backend AI to invent an aesthetic name for a new playlist.

Phase 6: Machine Learning (Recommendation Engine)
The goal was to replace random song suggestions with mathematical, data-driven recommendations.

What we did in the Backend:

Collaborative Filtering Algorithm: We wrote a custom mathematical engine from scratch. It looks at the logged-in user, finds all other users in the database who like the exact same songs, and assigns them a "similarity weight."

Recommendation Scoring: The algorithm looks at what else those highly similar users are listening to, scores those songs, and sends the highest-scoring tracks back to the user.

Cold Start Fallback: We added a backup system (Content-Based filtering) so that if a user is completely new and has no similar matches, the system looks at the genres of the few songs they do like and finds matches based on tags instead.

What we did in the Frontend:

"Made For You" Section: We added a dedicated row on the Home page that specifically calls this new Machine Learning endpoint and displays the personalized mix.

Phase 7: Polish & User Experience
The goal was to make the application look and feel like a premium, production-ready product.

What we did in the Frontend:

Spotify-Style Profile: We built a beautiful user profile page with CSS gradients, displaying the user's name, email, and account type (Admin or Free User).

Subscription Modals: We designed a "MelodyHub Premium" card. When users click "Upgrade," a sleek overlay dims the screen and displays a "Coming Soon" message, handling the user interaction gracefully.

Edit Profile Modal: We added a pop-up form allowing users to type a new name or email.

What we did in the Backend:

Profile Update Route: We built a PUT route that takes the newly typed name/email from the Edit Profile modal, updates the specific user's document in MongoDB, and returns the fresh data to the frontend so the screen updates instantly.