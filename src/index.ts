import { Application, Router } from "@oakserver/oak";
import { getWeather } from "./routes/weather.route";
import { postRegister } from "./routes/register.route";
import { rateLimiter } from "./middleware/rate-limiter";
import { logging } from "./middleware/logging";

const router = new Router();
router.get("/weather", getWeather);
router.post("/register", postRegister);

const app = new Application();
app.use(rateLimiter);
app.use(logging);
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 3000, hostname: "0.0.0.0" });