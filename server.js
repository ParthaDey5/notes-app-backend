const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Notes API: http://localhost:${PORT}/api/notes`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`📊 Live Dashboard: http://localhost:${PORT}/api/notes/live`);
});