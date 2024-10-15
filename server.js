const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

const indexRouter = require('./routes/index');

app.use(express.json());
app.use('/', indexRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
