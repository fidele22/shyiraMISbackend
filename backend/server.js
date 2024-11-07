const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Make sure this line is present
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file
const MongoStore = require('connect-mongo');
const session = require('express-session');
const connectDB = require('./config/db');
const departmentRoutes = require('./routes/departmentRoutes')
const serviceRoutes = require('./routes/serviceRoutes')
const positionRoutes =require ('./routes/positionRoutes')
const userRoleRoutes = require ('./routes/userRolesRoute')
const userRoutes = require('./routes/userRoutes');
const loginRoute = require('./routes/loginRoutes');
const userRequest =require('./routes/requsitionRoute');
const userProfileRoutes = require('./routes/userProfileroute')
const forwardedRequestsRouter = require('./routes/requesttodaf');
const countRequisitionRouter = require('./routes/countRequisitions')

const stockRoutes = require('./routes/stockRoutes');
const stockItem = require ('./models/stockItems')
const StockHistory = require('./models/stockHistory');
const approvedRoutes= require ('./routes/requestApproved')
const logisticRequestsRoutes = require('./routes/requestOflogisticRoute')
const fuelRequisitionRoute = require('./routes/fuelRequestRoute');
const logisticfuelRouter  =require ('./routes/fuelLogisticRouter')
const userfuelRouter = require ('./routes/userFuelrouter')
const addCarRoute = require ('./routes/carplaque')
const fuelStock = require ('./routes/fuelstock')
const StockData = require('./models/stockData')

const RepairRequisition = require('./routes/RepairRequisition')

const userdataRoutes =require ('./routes/userData')


const app = express();
app.use(express.json()); // Or use body-parser's JSON parser
app.use(bodyParser.json()); // If using body-parser

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's local address and port
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, // If you're using cookies or authorization headers
}));

connectDB();

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
 // store: MongoStore.create('mongodb://localhost:27017/shyiradb'),
  cookie: { secure: false } // Set to true in production with HTTPS
}));

//


//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH ||'uploads')));
app.use('/files', express.static(path.join(__dirname, process.env.UPLOAD_FILE || 'files')));

app.get('/', (req, res) => {
  res.send('Static file serving test');
});


// Use auth routes
app.use('/api/departments', departmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/roles', userRoleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile',userProfileRoutes)
app.use('/api/userdata',userdataRoutes)
app.use('/api', loginRoute);
app.use('/api/approve', approvedRoutes);
app.use('/api/LogisticRequest', logisticRequestsRoutes);
app.use('/api/fuel',fuelStock);
app.use('/api/fuel-requisition', fuelRequisitionRoute);
app.use('/api/forms-data',addCarRoute );
app.use('/api/logisticFuel',logisticfuelRouter );
app.use('/api/userfuelrequest', userfuelRouter);
app.use('/api/countrequisitions',countRequisitionRouter)
// Routes
app.use('/api/UserRequest', userRequest);
app.use('/api/forwardedrequests', forwardedRequestsRouter);
app.use('/api/stocks', stockRoutes); 
app.use('/api/RepairRequisition',RepairRequisition)

 // Route to get the count of user requests


// Logout route
app.post('/api/logout', (req, res) => {
  console.log('Logout request received');
  try {
    res.status(200).json({ message: 'Logged out successfully. Please delete your token on the client side.' });
  } catch (err) {
    console.error('Error during logout:', err); // Log the error
    res.status(500).json({ message: 'Server error during logout' });
  }
});








// Endpoint to handle uploaded data
app.post('/api/uploadData', async (req, res) => {
  try {
    const data = req.body;

    // Insert items in bulk
    const savedItems = await stockItem.insertMany(data);

    // Automatically create corresponding stock data for each item
    const stockDatas = savedItems.map(item => ({
      itemId: item._id,
      entry: {
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        totalAmount: item.totalAmount
      },
      exit: {
        quantity: 0,
        pricePerUnit: 0,
        totalAmount: 0
      },
      balance: {
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        totalAmount: item.totalAmount
      }
    }));

    await StockData.insertMany(stockDatas);
 // Automatically create corresponding initial stock history for each item
 const stockHistory = savedItems.map(item => ({
  itemId: item._id,
  entry: {
    quantity: item.quantity,
    pricePerUnit: item.pricePerUnit,
    totalAmount: item.totalAmount
  },
  exit: {
    quantity: 0,
    pricePerUnit: 0,
    totalAmount: 0
  },
  balance: {
    quantity: item.quantity,
    pricePerUnit: item.pricePerUnit,
    totalAmount: item.totalAmount
  }
}));

await StockHistory.insertMany(stockHistory);

    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).send({ success: false, error: error.message });
  }
});



// Endpoint to get stock history by item ID
app.get('/api/getStockHistory/:itemId', async (req, res) => {
  try {
    const stockHistory = await StockData.find({ itemId: req.params.itemId }).populate('itemId');
    res.status(200).json(stockHistory);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve the frontend's index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});



 const PORT = process.env.PORT || 5000;
 app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
 });
