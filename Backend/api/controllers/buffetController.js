const Buffet = require('../models/Buffet');

// Controller function to handle GET request for buffet
const getBuffetRequests = async (req, res) => {
  try {
    console.log("Fetching all buffet requests...");
    // Retrieve all buffet requests from the database
    const buffetRequests = await Buffet.find();
    console.log(`Found ${buffetRequests.length} buffet requests`);
    res.status(200).json(buffetRequests);
  } catch (error) {
    console.error('Error fetching buffet requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to handle POST request for buffet
const submitBuffetRequest = async (req, res) => {
  try {
    console.log("Received buffet request:", JSON.stringify(req.body, null, 2));
    
    // Extract data from the request body
    const {
      name,
      email,
      phoneNumber,
      eventType,
      numberOfGuests,
      date,
      time,
      packageName,
      selected,
      specialRequests,
      isVeg,
      paymentId,
      paid,
      paymentMethod
    } = req.body;

    // Create a new buffet document
    const newBuffet = new Buffet({
      name,
      email,
      phoneNumber,
      eventType,
      numberOfGuests,
      date: new Date(date),
      time,
      packageName,
      selected: Array.isArray(selected) ? selected : [],
      specialRequests,
      isVeg: Boolean(isVeg),
      paymentId,
      paid: Boolean(paid),
      paymentMethod
    });

    console.log("Creating new buffet document:", JSON.stringify(newBuffet, null, 2));

    // Save the new buffet document to the database
    const savedBuffet = await newBuffet.save();
    console.log("Buffet document saved successfully with ID:", savedBuffet._id);

    // Send a success response
    res.status(201).json({ 
      message: 'Buffet request submitted successfully', 
      buffet: savedBuffet 
    });
  } catch (error) {
    console.error('Error submitting buffet request:', error);
    // Return more detailed error information
    res.status(500).json({ 
      message: 'Error submitting buffet request', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
const deleteBuffetByName = async (req, res) => {
  try {
    const { name } = req.params;
    // Find buffet item by name and delete it
    await Buffet.deleteOne({ name });
    res.status(200).json({ message: 'Buffet item deleted successfully' });
  } catch (error) {
    console.error('Error deleting buffet item by name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Controller function to handle GET request for buffet stats
const getBuffetStats = async (req, res) => {
  try {
    // Calculate buffet stats here, for example:
    const totalRequests = await Buffet.countDocuments();
    // You can calculate other stats as needed

    // Send the buffet stats as response
    res.status(200).json({ requests: totalRequests });
  } catch (error) {
    console.error('Error fetching buffet stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  deleteBuffetByName,
  getBuffetRequests,
  submitBuffetRequest,
  getBuffetStats,
};
