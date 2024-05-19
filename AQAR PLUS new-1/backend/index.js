const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing
const nodemailer = require('nodemailer');
const app = express();
const jwt = require('jsonwebtoken');
const port = 3016;
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'irshaad'
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_email_password'
  }
});
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'ReemAlOtaiby12434itsoftwareengineer', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  // Check if email exists in database
  connection.query('SELECT * FROM register WHERE email = ?', [email], async (error, results, fields) => {
    if (error) {
      console.error('Error retrieving user data: ' + error.stack);
      res.status(500).send('Error retrieving user data');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    // Generate a secure token
    const resetToken = jwt.sign({ email: email }, 'ReemAlOtaiby12434itsoftwareengineer', { expiresIn: '1h' });
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the token and expiration time in the database
    connection.query('UPDATE register SET password_reset_token = ?, token_expiration = ? WHERE email = ?', [resetToken, tokenExpiration, email], async (error, results, fields) => {
      if (error) {
        console.error('Error updating user data with reset token: ' + error.stack);
        res.status(500).send('Error updating user data with reset token');
        return;
      }

      // Send email with password reset link
      const resetLink = `http://yourfrontenddomain.com/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Please click on the following link to reset your password: ${resetLink}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email: ' + error.stack);
          res.status(500).send('Error sending email');
          return;
        }
        
        console.log('Email sent: ' + info.response);
        res.status(200).send('Password reset email sent');
      });
    });
  

    // Generate temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8); // Generate 8-character random password

    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update user's password with the temporary password
    connection.query('UPDATE register SET password = ? WHERE email = ?', [hashedPassword, email], async (error, results, fields) => {
      if (error) {
        console.error('Error updating user password: ' + error.stack);
        res.status(500).send('Error updating user password');
        return;
      }

      // Send email with temporary password
      const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Your temporary password is: ${temporaryPassword}\n\nPlease use this password to login and change your password.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email: ' + error.stack);
          res.status(500).send('Error sending email');
          return;
        }
        
        console.log('Email sent: ' + info.response);
        res.status(200).send('Password reset email sent');
      });
    });
  });
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    const sql = 'INSERT INTO register (name, email, password) VALUES (?, ?, ?)';
    const values = [name, email, hashedPassword];

    connection.query(sql, values, (error, results, fields) => {
      if (error) {
        console.error('Error inserting data: ' + error.stack);
        res.status(500).send('Error inserting data');
        return;
      }
      console.log('Inserted data successfully');
      res.status(200).send('Inserted data successfully');
    });
  } catch (error) {
    console.error('Error hashing password: ' + error);
    res.status(500).send('Error hashing password');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  connection.query('SELECT * FROM register WHERE email = ?', [email], async (error, results, fields) => {
    if (error) {
      console.error('Error retrieving user data: ' + error.stack);
      res.status(500).send('Error retrieving user data');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('User not found');
      return;
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password); // Compare hashed password

    if (!passwordMatch) {
      res.status(401).send('Invalid password');
      return;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, 'ReemAlOtaiby12434itsoftwareengineer', { expiresIn: '1h' });

    res.status(200).json({ token });
  });
});
app.post('/properties', (req, res) => {
  const { name, price, description, image } = req.body;
  const sql = 'INSERT INTO property (name, price, description, image) VALUES (?, ?, ?, ?)';
  connection.query(sql, [name, price, description, image], (err, result) => {
    if (err) {
      console.error('Error inserting property:', err);
      res.status(500).send('Error inserting property');
    } else {
      console.log('Property inserted successfully');
      res.status(201).send('Property inserted successfully');
    }
  });
});

app.put('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { email } = req.body;

  try {
    // Update the user's email in the database
    await connection.query('UPDATE register SET email = ? WHERE id = ?', [email, userId]);

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  
  connection.query('SELECT email, password FROM register WHERE id = ?', [userId], (error, results, fields) => {
    if (error) {
      console.error('Error retrieving user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = {
      email: results[0].email,
      password: results[0].password,
      // Add more profile details here if needed
    };
    res.status(200).json(userProfile);
  });
});

app.post('/add_property', (req, res) => {
  const { property_name, price, description, owner_name, owner_contact, image_url } = req.body;
  const sql = `INSERT INTO Properties (property_name, price, description, owner_name, owner_contact, image_url) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  connection.query(sql, [property_name, price, description, owner_name, owner_contact, image_url], (err, result) => {
      if (err) {
          console.error('Error inserting property into MySQL database:', err);
          return res.status(400).json({ error: 'An error occurred while adding the property' });
      }
      console.log('Property added to MySQL database');
      res.status(201).json({ message: 'Property added successfully' });
  });
})
app.delete('/delete_property/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM Properties WHERE id = ?`;
  connection.query(sql, [id], (err, result) => {
      if (err) {
          console.error('Error deleting property from MySQL database:', err);
          return res.status(400).json({ error: 'An error occurred while deleting the property' });
      }
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Property not found' });
      }
      console.log('Property deleted from MySQL database');
      res.status(200).json({ message: 'Property deleted successfully' });
  });
});
app.put('/update_property/:id', (req, res) => {
  const { id } = req.params;
  const { property_name, price, description, owner_name, owner_contact, image_url } = req.body;
  const sql = `UPDATE Properties 
               SET property_name = ?, price = ?, description = ?, owner_name = ?, owner_contact = ?, image_url = ? 
               WHERE id = ?`;
  connection.query(sql, [property_name, price, description, owner_name, owner_contact, image_url, id], (err, result) => {
      if (err) {
          console.error('Error updating property in MySQL database:', err);
          return res.status(400).json({ error: 'An error occurred while updating the property' });
      }
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Property not found' });
      }
      console.log('Property updated in MySQL database');
      res.status(200).json({ message: 'Property updated successfully' });
  });
});


app.get('/properties', (req, res) => {
  const sql = 'SELECT * FROM Properties';
  connection.query(sql, (err, results) => {
      if (err) {
          console.error('Error fetching properties from MySQL database:', err);
          return res.status(500).json({ error: 'An error occurred while fetching properties' });
      }
      res.json(results);
  });
});
app.post('/services', (req, res) => {
  const { image, name, description } = req.body;

  if (!image || !name || !description) {
    return res.status(400).json({ error: 'Image, name, and description are required.' });
  }

  const data = { image, name, description };

  connection.query('INSERT INTO services SET ?', data, (err, results) => {
    if (err) {
      console.error('Error inserting data: ' + err);
      return res.status(500).json({ error: 'Error inserting data.' });
    }
    console.log('Data inserted successfully');
    return res.status(201).json({ message: 'Data inserted successfully' });
  });
});
app.put('/update_service/:id', (req, res) => {
  const { id } = req.params;
  const { image, name, description } = req.body;
  const sql = `UPDATE services 
               SET image = ?, name = ?, description = ? 
               WHERE id = ?`;
  connection.query(sql, [image, name, description, id], (err, result) => {
    if (err) {
      console.error('Error updating service in MySQL database:', err);
      return res.status(400).json({ error: 'An error occurred while updating the service' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    console.log('Service updated in MySQL database');
    res.status(200).json({ message: 'Service updated successfully' });
  });
});

// DELETE endpoint to delete a service
app.delete('/delete_service/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM services WHERE id = ?`;
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting service from MySQL database:', err);
      return res.status(400).json({ error: 'An error occurred while deleting the service' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    console.log('Service deleted from MySQL database');
    res.status(200).json({ message: 'Service deleted successfully' });
  });
});


// Endpoint to get all services
app.get('/services', (req, res) => {
  connection.query('SELECT * FROM services', (err, results) => {
    if (err) {
      console.error('Error fetching services: ' + err);
      return res.status(500).json({ error: 'Error fetching services.' });
    }
    return res.status(200).json(results);
  });
});

app.post('/reviews', (req, res) => {
  const { comment } = req.body;

  // Validate incoming data
  if (!comment) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  // Insert data into the reviews table
  const sql = 'INSERT INTO reviews (comment) VALUES (?)';
  connection.query(sql, [comment ], (error, results) => {
    if (error) {
      console.error('Error inserting review:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Return success response
    res.status(201).json({ message: 'Review added successfully', reviewId: results.insertId });
  });
});
app.get('/reviews', (req, res) => {
  const query = 'SELECT * FROM reviews';

  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching reviews' });
    } else {
      res.status(200).json(results);
    }
  });
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

