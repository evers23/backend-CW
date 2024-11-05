// server.js
import express from 'express';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';  // Importamos el middleware cors

const { Pool } = pkg; // Usar la importación por defecto para el módulo 'pg'

// Crear una instancia de Express
const app = express();
app.use(express.json());
app.use(cors());  // Usamos el middleware CORS en el servidor

// Configurar la conexión con PostgreSQL
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',      // Tu usuario de PostgreSQL
  password: '1234',      // Tu contraseña de PostgreSQL
  database: 'Coworking', // Asegúrate de que el nombre de la base de datos sea correcto
  port: 5432             // Puerto estándar de PostgreSQL
});

// Clave secreta para firmar los tokens JWT
const JWT_SECRET = 'tu_clave_secreta';

// Ruta para registrar un nuevo usuario
app.post('/usuarios', async (req, res) => {
  const { email, password, rol, lenguage } = req.body;

  if (!email || !password || !rol || !lenguage) {
    console.log('Todos los campos son obligatorios:', req.body);
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, rol, lenguage]
    );

    console.log('Usuario registrado:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar el usuario:', error.message);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// Ruta para iniciar sesión y obtener un token JWT
app.post('/login', async (req, res) => {
  console.log('Recibiendo solicitud de inicio de sesión:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Email o contraseña no proporcionados.');
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    console.log('Contraseña proporcionada:', password);
    console.log('Contraseña almacenada (hash):', user.password);

    // Compara la contraseña con el hash almacenado
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('¿Contraseña coincide?', isMatch);

    if (!isMatch) {
      console.log('Contraseña incorrecta para usuario:', email);
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generado:', token);

    res.json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});



// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Token no proporcionado.');
    return res.status(401).json({ error: 'Token requerido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token inválido.');
      return res.status(403).json({ error: 'Token inválido.' });
    }

    req.user = user;
    next();
  });
};

// Ruta para obtener los datos del usuario autenticado
app.get('/usuarios', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [req.user.email]);
    const user = result.rows[0];

    if (!user) {
      console.log('Usuario no encontrado:', req.user.email);
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    console.log('Datos del usuario:', user);
    res.json(user);
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error.message);
    res.status(500).json({ error: 'Error al obtener los datos del usuario.' });
  }
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});


