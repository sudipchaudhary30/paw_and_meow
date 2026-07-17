require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Product = require('../models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Pet.deleteMany(), Product.deleteMany()]);

  // Create admin
  // Create admin from environment variables (do NOT keep plaintext credentials in source)
  let admin = null;
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log('Admin account created:', process.env.ADMIN_EMAIL);
  } else {
    console.log('Skipping admin creation. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment to create one.');
  }

  // Optional sample user from environment (skip if not provided)
  if (process.env.SAMPLE_USER_EMAIL && process.env.SAMPLE_USER_PASSWORD) {
    await User.create({
      name: process.env.SAMPLE_USER_NAME || 'Sample User',
      email: process.env.SAMPLE_USER_EMAIL,
      password: process.env.SAMPLE_USER_PASSWORD,
      role: 'user'
    });
    console.log('Sample user created:', process.env.SAMPLE_USER_EMAIL);
  } else {
    console.log('Skipping sample user creation. Set SAMPLE_USER_EMAIL and SAMPLE_USER_PASSWORD to create one.');
  }

  // Sample pets
  const pets = [
    { name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: 2, gender: 'Male', description: 'Friendly and playful golden retriever.', vaccinated: true, neutered: false, status: 'Available', createdBy: admin ? admin._id : undefined },
    { name: 'Luna', species: 'Cat', breed: 'Persian', age: 1, gender: 'Female', description: 'Calm and affectionate Persian cat.', vaccinated: true, neutered: true, status: 'Available', createdBy: admin ? admin._id : undefined },
    { name: 'Max', species: 'Dog', breed: 'Labrador', age: 3, gender: 'Male', description: 'Energetic Labrador who loves outdoors.', vaccinated: true, neutered: false, status: 'Available', createdBy: admin ? admin._id : undefined },
    { name: 'Bella', species: 'Rabbit', breed: 'Holland Lop', age: 1, gender: 'Female', description: 'Gentle rabbit great for families.', vaccinated: false, neutered: false, status: 'Available', createdBy: admin ? admin._id : undefined },
    { name: 'Tweety', species: 'Bird', breed: 'Canary', age: 1, gender: 'Unknown', description: 'Beautiful singing canary.', vaccinated: false, neutered: false, status: 'Available', createdBy: admin ? admin._id : undefined },
  ];
  await Pet.insertMany(pets);

  // Sample products
  const products = [
    { name: 'Premium Dog Food 5kg', category: 'Food', price: 1800, stock: 50, description: 'High protein dog food for all breeds.', petType: ['Dog'], brand: 'PawNutrition' },
    { name: 'Cat Treats - Tuna Flavor', category: 'Treats', price: 350, stock: 100, description: 'Delicious tuna treats for cats.', petType: ['Cat'], brand: 'WhiskerBite' },
    { name: 'Squeaky Bone Toy', category: 'Toys', price: 250, stock: 80, description: 'Durable rubber squeaky toy for dogs.', petType: ['Dog'], brand: 'PlayPet' },
    { name: 'Pet Grooming Kit', category: 'Grooming', price: 1200, stock: 30, description: 'Complete grooming kit for dogs and cats.', petType: ['Dog', 'Cat'], brand: 'GroomPro' },
    { name: 'Bird Seed Mix 1kg', category: 'Food', price: 450, stock: 60, description: 'Nutritious seed mix for pet birds.', petType: ['Bird'], brand: 'BirdFeast' },
    { name: 'Adjustable Pet Collar', category: 'Accessories', price: 300, stock: 120, description: 'Comfortable adjustable collar for dogs and cats.', petType: ['Dog', 'Cat'], brand: 'PetWear' },
    { name: 'Cat Litter 10L', category: 'Accessories', price: 800, stock: 45, description: 'Clumping cat litter with odor control.', petType: ['Cat'], brand: 'CleanPaw' },
    { name: 'Interactive Feather Wand', category: 'Toys', price: 180, stock: 90, description: 'Feather wand toy to keep cats active.', petType: ['Cat'], brand: 'PlayPet' },
  ];
  await Product.insertMany(products);

  console.log('✅ Database seeded successfully!');
  mongoose.disconnect();
};

seed().catch(console.error);
