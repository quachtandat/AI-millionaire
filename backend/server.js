const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5555;

async function startServer() {
    try {
        // Test kết nối MySQL
        const connection = await pool.getConnection();

        console.log("MySQL connected successfully!");

        connection.release();

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Unable to connect to MySQL:");
        console.error(error.message);

        process.exit(1);
    }
}

startServer();