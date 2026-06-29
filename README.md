# Paw Home

Pet Security Platform is a secure pet adoption and pet accessories e-commerce platform developed using the MERN stack with Next.js. The platform allows users to explore pets available for adoption, schedule pet visits, and purchase pet related products such as accessories, food, and toys. It also includes a dedicated admin panel for managing pets, products, orders, and user activities. The system focuses heavily on security, scalability, and user experience.

The platform is built using modern web technologies. The frontend and admin panel are developed with Next.js 14, React, and Tailwind CSS to ensure fast performance and responsive design. The backend is powered by Node.js and Express.js, providing a robust REST API for all core operations. MongoDB is used as the database, and MongoDB Compass is recommended for visual database management. Security is implemented using JWT authentication, bcrypt password hashing, role based access control, input validation, and activity logging.

The project follows a structured architecture with three main components. The frontend folder contains the user facing frontend running on port 3000. The admin folder contains the admin dashboard running on port 3001. The backend folder contains the Express backend API running on port 5000. Environment variables are stored in the root .env file, alongside the README documentation.

Before running the project, ensure you have Node.js version 18 or higher installed. You also need MongoDB running locally or a MongoDB Atlas connection string. Installing MongoDB Compass is helpful for managing and viewing database collections.

To set up the project, install dependencies separately for the backend, frontend, and admin panel. Start by navigating to the backend directory and running npm install. Then move to the frontend directory and install its dependencies. Finally, repeat the process for the admin directory.

After installing dependencies, configure the environment variables by editing the .env file. Set the MongoDB connection string in MONGO_URI and define a strong secret key for JWT_SECRET. These variables are required for database connection and secure authentication.

Once the environment is configured, run the platform using three separate terminals. In the first terminal, start the API server from the backend folder using npm run dev. In the second terminal, start the frontend application from the frontend folder. In the third terminal, start the admin panel from the admin folder. This launches the full platform for development.

After starting the server, create the initial admin account. This can be done by sending a POST request to the /api/auth/register endpoint with admin credentials including name, email, password, and role set to admin. Alternatively, the seed script can be used by running npm run seed inside the backend directory.

The MongoDB database contains several collections to manage platform data. The users collection stores registered users and admin accounts. The pets collection stores pet listings available for adoption. The products collection contains pet related products such as accessories and food items. The visitrequests collection stores scheduled pet visit requests. The orders collection manages product orders and checkout details. The logs collection stores security and activity related audit logs.

Security is a major focus of the platform. JWT authentication ensures secure token based login sessions. Passwords are protected using bcrypt hashing with 12 salt rounds. Role based access control ensures proper separation between admin and user permissions. Input validation protects the system from invalid or malicious requests. Activity logging tracks sensitive actions across the platform. CORS restrictions limit access to trusted client origins. Rate limiting helps prevent brute force attacks. Helmet is used to secure HTTP headers and improve protection against common web vulnerabilities.

The platform exposes multiple REST API endpoints for different functionalities. Authentication endpoints include user registration, login, and fetching the currently logged in user. Pet endpoints allow users to browse pets and admins to create, update, or delete pet listings. Visit request endpoints allow users to request pet visits and admins to manage visit statuses. Product endpoints handle product listing and management. Order endpoints allow users to place orders and view their order history, while admins manage all platform orders.

This platform is designed to provide a secure and efficient environment for pet adoption and pet commerce. By combining strong security practices with modern web development technologies, Pet Security Platform delivers a reliable solution for both users and administrators.
