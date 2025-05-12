import express from "express";
import { userRoute } from "../modules/user/user.route.js";
import { messageRoute } from "../modules/message/message.route.js";
import { sessionRoute } from "../modules/session/session.route.js";
import { transcribeRoute } from "../modules/transcribe/transcribe.route.js";
import { followupRoute } from "../modules/followup/followup.route.js";

const router = express.Router();

router.use("/users", userRoute);
router.use("/messages", messageRoute);
router.use("/sessions", sessionRoute);
router.use("/transcribe", transcribeRoute);
router.use("/followup", followupRoute);
export default router;
