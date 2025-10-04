const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Added name field
  image: String,
  desc: String,
  link: String
});
const Project = mongoose.model('Project', projectSchema);

// Skill Schema
const skillSchema = new mongoose.Schema({
  name: String,
  level: String
});
const Skill = mongoose.model('Skill', skillSchema);

// Routes
app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const { name, desc, link } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const newProject = new Project({ name, image, desc, link });
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/skills', async (req, res) => {
  const newSkill = new Skill(req.body);
  await newSkill.save();
  res.json(newSkill);
});

app.get('/api/skills', async (req, res) => {
  const skills = await Skill.find();
  res.json(skills);
});

// Update skill
app.put('/api/skills/:id', async (req, res) => {
  try {
    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSkill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete skill
app.delete('/api/skills/:id', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(5000, () => console.log('Server running on port 5000'));
