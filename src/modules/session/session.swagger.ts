/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: API for creating and managing chat sessions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the session
 *         userId:
 *           type: string
 *           description: ID of the user who owns the session
 *         model:
 *           type: string
 *           description: The LLM model used for this session
 *         pin:
 *           type: boolean
 *           description: Whether the session is pinned by the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the session was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the session was last updated
 */

/**
 * @swagger
 * /api/v1/sessions:
 *   post:
 *     summary: Create a new chat session
 *     description: Creates a new session record for the authenticated user, with an optional LLM model.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 description: Optional model name (defaults to gpt-3.5-turbo)
 *     responses:
 *       200:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error when creating session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   get:
 *     summary: List all chat sessions
 *     description: Retrieves all sessions for the authenticated user, sorted by most recent.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of session objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error when fetching sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/sessions/{id}/pin:
 *   patch:
 *     summary: Toggle pin status of a session
 *     description: Flips the pin flag on a given session, allowing users to pin/unpin sessions.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the session to pin or unpin
 *     responses:
 *       200:
 *         description: Pin status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pin:
 *                   type: boolean
 *                   description: The new pin status of the session
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
 *         description: Server error when toggling pin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
