const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const poplib = require('poplib');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'todo_db',
  password: 'password',
  port: 5432,
});

// Маршруты для задач (оставляем без изменений)
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Новый функционал для работы с почтой

// Конфигурация почтового клиента (замените на свои данные)
const emailConfig = {
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com', // Ваш email
      pass: 'your-app-password',    // Пароль приложения (для Gmail)
    },
  },
  imap: {
    user: 'your-email@gmail.com',
    password: 'your-app-password',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
  },
  pop3: {
    hostname: 'pop.gmail.com',
    port: 995,
    tls: true,
    username: 'your-email@gmail.com',
    password: 'your-app-password',
  },
};

// Функция отправки письма через SMTP
const sendEmail = async (task) => {
  const transporter = nodemailer.createTransport(emailConfig.smtp);

  const mailOptions = {
    from: emailConfig.smtp.auth.user,
    to: emailConfig.smtp.auth.user, // Можно изменить на другой email
    subject: `Task Reminder: ${task.title}`,
    text: `Task Details:\nTitle: ${task.title}\nDescription: ${task.description}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Функция проверки писем через IMAP
const checkEmailsIMAP = () => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(emailConfig.imap);
    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) return reject(err);
        imap.search(['ALL'], (err, results) => {
          if (err) return reject(err);
          const emails = results.map((uid) => ({ uid }));
          imap.end();
          resolve({ success: true, emails });
        });
      });
    });

    imap.once('error', (err) => reject(err));
    imap.once('end', () => console.log('IMAP connection ended'));
    imap.connect();
  });
};

// Функция проверки писем через POP3
const checkEmailsPOP3 = () => {
  return new Promise((resolve, reject) => {
    const client = new poplib.Client({
      hostname: emailConfig.pop3.hostname,
      port: emailConfig.pop3.port,
      tls: emailConfig.pop3.tls,
    });

    client.on('error', (err) => reject(err));

    client.connect((err) => {
      if (err) return reject(err);
      client.login(
        emailConfig.pop3.username,
        emailConfig.pop3.password,
        (err) => {
          if (err) return reject(err);
          client.list((err, mailbox) => {
            if (err) return reject(err);
            client.quit();
            resolve({ success: true, emails: mailbox });
          });
        }
      );
    });
  });
};

// Новый маршрут для отправки письма по задаче
app.post('/api/send-email/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = result.rows[0];
    const emailResult = await sendEmail(task);
    if (emailResult.success) {
      res.json({ message: emailResult.message });
    } else {
      res.status(500).json({ error: emailResult.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Новый маршрут для проверки писем через IMAP
app.get('/api/check-emails-imap', async (req, res) => {
  try {
    const result = await checkEmailsIMAP();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Новый маршрут для проверки писем через POP3
app.get('/api/check-emails-pop3', async (req, res) => {
  try {
    const result = await checkEmailsPOP3();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});