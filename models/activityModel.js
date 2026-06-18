const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../database.json');

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

const ActivityModel = {
    getAll: () => {
        try {
            return JSON.parse(fs.readFileSync(DB_FILE));
        } catch (err) {
            return [];
        }
    },
    
    save: (record) => {
        const dbData = ActivityModel.getAll();
        dbData.push(record);
        fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
        return record;
    }
};

module.exports = ActivityModel;
