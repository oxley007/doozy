// server.js
const app = require('./index'); // your current Express app file

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🔥 Server listening on port ${PORT}`);
});
