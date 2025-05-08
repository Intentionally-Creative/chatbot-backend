/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with email, password, and liquor store details.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - storeName
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@get-creative.co
 *               password:
 *                 type: string
 *                 example: 12345
 *               name:
 *                 type: string
 *                 example: John Doe
 *               storeName:
 *                 type: string
 *                 example: Downtown Liquors
 *                 description: The name of the liquor store
 *               liquorAddress:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: USA
 *                   city:
 *                     type: string
 *                     example: New York
 *                   state:
 *                     type: string
 *                     example: NY
 *                   postalCode:
 *                     type: string
 *                     example: "10001"
 *     responses:
 *       200:
 *         description: User registered successfully with JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT access token
 *                     user:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         storeName:
 *                           type: string
 *                           description: The name of the liquor store
 *                         liquorAddress:
 *                           type: object
 *                           properties:
 *                             country:
 *                               type: string
 *                             city:
 *                               type: string
 *                             state:
 *                               type: string
 *                             postalCode:
 *                               type: string
 *       400:
 *         description: Bad request - Missing required fields or email already in use
 *       500:
 *         description: Server error during registration
 */
/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user using email and password.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@get-creative.co
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 example: 12345
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: User logged in successfully with JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT access token
 *                     user:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         storeName:
 *                           type: string
 *                           description: The name of the liquor store
 *                         liquorAddress:
 *                           type: object
 *                           properties:
 *                             country:
 *                               type: string
 *                             city:
 *                               type: string
 *                             state:
 *                               type: string
 *                             postalCode:
 *                               type: string
 *       400:
 *         description: Bad request - Invalid credentials
 *       500:
 *         description: Server error during login
 */
/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generates new access and refresh tokens using a valid refresh token.
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to generate new tokens
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tokens refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: New JWT refresh token
 *       401:
 *         description: Unauthorized - Invalid refresh token or user not found
 *       500:
 *         description: Server error during token refresh
 */
