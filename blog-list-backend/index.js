const app = require("./app");
const config = require("./utils/config");

const PORT = config.PORT;

app.get("/", (request, response) => {
  response.send(`Connected on ${PORT}. Use /api/blog to access db routes.`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
