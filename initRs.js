import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/?directConnection=true')
  .then(async () => {
    console.log("Connected directly to MongoDB...");
    const admin = mongoose.connection.db.admin();
    try {
        const res = await admin.command({ 
            replSetInitiate: { 
                _id: "rs0", 
                members: [{ _id: 0, host: "127.0.0.1:27017" }] 
            } 
        });
        console.log("Replica Set Initialized Successfully:", res);
    } catch (err) {
        if (err.message.includes('already initialized')) {
            console.log("Replica Set is already initialized!");
        } else {
            console.error("Error initializing replica set:", err);
        }
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
