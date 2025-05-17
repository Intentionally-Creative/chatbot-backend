import express from "express";
import { asyncWrapper } from "../../utils/async-wrapper.js";
import { createTicket } from "./ticket.controller.js";
import { validateReqBody } from "../../middlewares/validation.middleware.js";
import { ticketSchema } from "./ticket.validation.js";
import { isAuthenticated } from "../../middlewares/is-authenticated.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

router.post("/", validateReqBody(ticketSchema), asyncWrapper(createTicket));
// router.get("/", asyncWrapper(getTickets));

export { router as ticketRoute };
