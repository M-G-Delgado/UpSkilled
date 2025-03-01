const mongoose = require('mongoose');
const Course = require('../models/Course');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb+srv://UpSkilled:Beretta-M9@upskilled.jfcn3.mongodb.net/upskilled?retryWrites=true&w=majority&appName=UpSkilled', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB Atlas for seeding'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

// Path to courses.json in the server directory
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../courses.json'), 'utf8'));

async function seed() {
  try {
    await Course.deleteMany({});
    console.log('Cleared existing courses');
    const courses = [];
    for (const city in seedData) {
      for (const category in seedData[city]) {
        seedData[city][category].forEach(course => {
          course.city = city;
          course.category = category;
          courses.push(course);
        });
      }
    }
    await Course.insertMany(courses);
    console.log(`Seeded ${courses.length} courses successfully!`);
    const count = await Course.countDocuments();
    console.log(`Total courses in database: ${count}`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
}

seed();