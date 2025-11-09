const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const getCategories = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: parseInt(propertyId),
        userId: req.userId
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const categories = await prisma.category.findMany({
      where: { propertyId: parseInt(propertyId) },
      include: {
        _count: {
          select: { expenses: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId } = req.params;
    const { name } = req.body;

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: parseInt(propertyId),
        userId: req.userId
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        propertyId: parseInt(propertyId)
      }
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, id } = req.params;
    const { name } = req.body;

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: parseInt(propertyId),
        userId: req.userId
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const category = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        propertyId: parseInt(propertyId)
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name }
    });

    res.json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { propertyId, id } = req.params;

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: parseInt(propertyId),
        userId: req.userId
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const category = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        propertyId: parseInt(propertyId)
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
