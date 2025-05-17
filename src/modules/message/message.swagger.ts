/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: API for sending and retrieving chat messages
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the message
 *         sessionId:
 *           type: string
 *           description: ID of the session this message belongs to
 *         userId:
 *           type: string
 *           description: ID of the user who sent or received the message
 *         role:
 *           type: string
 *           enum:
 *             - user
 *             - assistant
 *           description: Whether the message was sent by the user or the assistant
 *         content:
 *           type: string
 *           description: The text content of the message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Message creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Message last update timestamp
 */

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Send a message to the assistant
 *     description: |
 *       Posts a user message to a chat session, persists it, sends the full conversation
 *       to the LLM backend, stores the assistant's reply, and returns that reply.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - content
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: The MongoDB ObjectId of the chat session
 *               content:
 *                 type: string
 *                 description: The user's message text
 *     responses:
 *       200:
 *         description: Assistant reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   description: The assistant's response to the user's message
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error when sending or storing message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/messages/{sessionId}:
 *   get:
 *     summary: Retrieve messages for a session
 *     description: |
 *       Fetches up to 50 of the most recent messages (sorted descending by creation time)
 *       for the given chat session.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the chat session
 *     responses:
 *       200:
 *         description: Array of message objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error when fetching messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Description of the error
 */

/**
 * @swagger
 * tags:
 *   name: Audio
 *   description: API for transcribing audio and managing chatbot interactions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TranscriptionResponse:
 *       type: object
 *       properties:
 *         reply:
 *           type: string
 *           description: Chatbot reply to the transcribed text
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing the issue
 */

/**
 * @swagger
 * /api/v1/transcribe:
 *   post:
 *     summary: Transcribe audio file and respond with chatbot reply
 *     description: |
 *       Transcribes uploaded audio files using OpenAI Whisper API and continues the chat session flow.
 *     tags: [Audio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file to transcribe
 *               sessionId:
 *                 type: string
 *                 description: ID of the chat session
 *             required:
 *               - audio
 *               - sessionId
 *     responses:
 *       200:
 *         description: Successfully transcribed and chatbot replied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TranscriptionResponse'
 *       400:
 *         description: Bad Request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found or unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error during transcription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
