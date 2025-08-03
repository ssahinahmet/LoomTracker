const app = require('./app');

const PORT = 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Loom Tracker backend ${PORT} portunda çalışıyor`);
});
