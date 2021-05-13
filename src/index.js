const express = require('express');
const app = express();
require('./db/mongoose');
const userRouter = require('./routes/user')
const remRouter = require('./routes/reminder')
const port = process.env.PORT;


app.use(express.json());
app.use(userRouter)
app.use(remRouter)



app.listen(port, () => {
    console.log("Server is up on ", port);
})