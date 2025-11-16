import express from 'express';




const app = express();

app.use(express.json());


app.listen(3000, () => {
  console.log('Auth service running on port 3000');
});export default app;// Additional authentication routes and middleware would go here