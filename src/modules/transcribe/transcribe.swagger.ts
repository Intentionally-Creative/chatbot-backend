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
