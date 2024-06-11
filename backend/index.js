const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const invoicesRoutes = require('./routes/invoices');
const analyticsRoutes = require('./routes/analytics');
const customersRoutes = require('./routes/customers');
const notificationsRoutes = require('./routes/notifications');
const authRoutes = require('./routes/auth');
const cron = require('node-cron');
const generateNotifications = require('./utils/generateNotifications');
const session = require('express-session');
const passport = require('./config/passport');
// const path = require('path');




// Schedule notifications generation to run daily at midnight
cron.schedule('0 0 * * *', () => {
    generateNotifications();
});

const backendURL = "https://invoicing-software.onrender.com/";
cron.schedule('*/14 * * * *',(res)=>{
console.log("Restarting server");
https.get(backendURL,(res)=>{
    console.log(backendURL)
    console.log(res)
    if(res.statusCode === 200){
        console.log("Server restarted")
    }else{
        console.error("Failed to restart server with error code:"+res.statusCode);
    }
}).on('error',(err)=>{
    console.error("Error during restart"+err.message)
})
});

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb+srv://rohitparakh4:Valorant4@cluster0.tq5zete.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


// // Serve static files from the React app
// app.use(express.static(path.join(__dirname, 'invoicing-app/build')));

// // Catch-all handler to serve index.html for any requests that don't match an API route
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'invoicing-app/build', 'index.html'));
// });


app.use(bodyParser.json());

const corsOptions = {
  origin: ["https://invoicing-software-frontend.onrender.com","http://localhost:3000"],
  default:"https://invoicing-software-frontend.onrender.com"
}

app.use(cors(corsOptions));

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log(err));


    app.use(session({
        secret: 'yourSecret',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    // Protect routes with authentication middleware
    const { ensureAuthenticated } = require('./middleware/auth');
const Notification = require('./models/Notification');
    
       
generateNotifications();
app.use('/api/', authRoutes);
app.use('/api/invoices',ensureAuthenticated, invoicesRoutes);
app.use('/api/analytics',ensureAuthenticated, analyticsRoutes);
app.use('/api/customers',ensureAuthenticated, customersRoutes);
app.use('/api/notifications',ensureAuthenticated, notificationsRoutes);
