// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Connection Error:', err));

// Multer setup (store image in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ======= SCHEMAS =======
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: String,
  link: String,
  image: String,       // Base64 string
  imageType: String    // "jpeg", "png", etc.
});
const Project = mongoose.model('Project', projectSchema);

const skillSchema = new mongoose.Schema({
  name: String,
  level: String
});
const Skill = mongoose.model('Skill', skillSchema);

// ======= ROUTES =======

// Add Project
app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const { name, desc, link } = req.body;
    let image = '';
    let imageType = '';

    if (req.file) {
      image = req.file.buffer.toString('base64');
      imageType = req.file.mimetype.split('/')[1];
    }

    const newProject = new Project({ name, desc, link, image, imageType });
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add skill
app.post('/api/skills', async (req, res) => {
  try {
    const newSkill = new Skill(req.body);
    await newSkill.save();
    res.json(newSkill);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
