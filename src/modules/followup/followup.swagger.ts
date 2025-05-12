/**
 * @swagger
 * tags:
 *   name: Follow-up
 *   description: AI-powered suggestions for follow-up questions in chat sessions
 */

/**
 * @swagger
 * /api/v1/followup:
 *   post:
 *     summary: Generate follow-up questions for a chat session
 *     description: |
 *       Returns 5 relevant follow-up questions based on previous messages in the chat session.
 *       If the session is new (no prior messages), default questions will be returned.
 *     tags: [Follow-up]
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
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: The MongoDB ObjectId of the chat session
 *           example:
 *             sessionId: "663bbfc1e3e7d8a4d58f4532"
 *     responses:
 *       200:
 *         description: List of 5 follow-up questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followUps:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "How can I optimize my inventory turnover?"
 *                     - "What are the best methods for training new employees quickly?"
 *                     - "How do I manage staff scheduling during holiday seasons?"
 *                     - "What are the best strategies for upselling premium spirits?"
 *                     - "How can I track and reduce inventory shrinkage?"
 *       400:
 *         description: Missing or invalid sessionId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized – missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found or not owned by user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
