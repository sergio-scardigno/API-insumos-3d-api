import express, { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => res.send('Home Page Route'));
app.get('/about', (req: Request, res: Response) =>
    res.send('About Page Route')
);
app.get('/portfolio', (req: Request, res: Response) =>
    res.send('Portfolio Page Route')
);
app.get('/contact', (req: Request, res: Response) =>
    res.send('Contact Page Route')
);

const port = process.env.PORT || 3000;

app.listen(port, () =>
    console.log(`Server running on ${port}, http://localhost:${port}`)
);
