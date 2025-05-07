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
 *               - liquorName
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
 *               liquorName:
 *                 type: string
 *                 example: Downtown Liquors
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
 *       201:
 *         description: User registered successfully with JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 */
