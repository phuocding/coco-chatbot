import express from "express";
import homeController from "../controllers/HomeController";

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);

  router.post("/setup-profile", homeController.setupProfile);
  router.post("/setup-persistent-menu", homeController.setupPersistentMenu);

  router.get("/webhook", homeController.getWebhook);
  router.post("/webhook", homeController.postWebhook);

  return app.use("/", router);
};

module.exports = initWebRoutes;
