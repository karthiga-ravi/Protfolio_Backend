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

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,          // Base64 string
  imageType: String,      // Example: "jpeg", "png"
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

// ======= ROUTES =======

// ✅ Add Project (Base64 image)
app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const { name, desc, link } = req.body;
    let image = '';
    let imageType = '';

    if (req.file) {
      image = req.file.buffer.toString('base64'); // Convert buffer to Base64
      imageType = req.file.mimetype.split('/')[1]; // Get "jpeg" or "png"
    }

    const newProject = new Project({ name, image, imageType, desc, link });
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    console.error('Error uploading project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get All Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Add Skill
app.post('/api/skills', async (req, res) => {
  try {
    const newSkill = new Skill(req.body);
    await newSkill.save();
    res.json(newSkill);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get Skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update Skill
app.put('/api/skills/:id', async (req, res) => {
  try {
    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSkill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Skill
app.delete('/api/skills/:id', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======= SERVER START =======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
