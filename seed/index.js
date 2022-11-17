const mongoose = require('mongoose');
const Team = require('../models/team.model');
const teams = require('./teams');

mongoose.connect('mongodb+srv://app:vbSczxBpNmkX5a4q@clustertff.h8qujjg.mongodb.net/?retryWrites=true&w=majority', { dbName: "tff-project" });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Team.deleteMany({});
    for (let i = 0; i < 19; i++) {
        
        const team = new Team({
            team: `${teams[i].team}`,
            logo: `${teams[i].url}`,
            
        })
        await team.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})