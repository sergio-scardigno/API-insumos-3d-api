import express from 'express';

const app = express();

app.get('/', (req, res) => res.send('Express on Vercel'));

// No necesitas `app.listen(...)` ya que Vercel lo maneja automáticamente.

export default app;
