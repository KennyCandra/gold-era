import app from "./app";
import { env } from "./config";

const port = env.port;

app.listen(port, () => {
  console.log("listening to port", port);
});
