const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const getProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { userId: req.userId },
      include: {
        _count: {
          select: {
            expenses: true,
            categories: true,
            debtors: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      },
      include: {
        categories: true,
        debtors: {
          include: {
            payments: true
          }
        },
        _count: {
          select: { expenses: true }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const property = await prisma.property.create({
      data: {
        name,
        description,
        userId: req.userId
      }
    });

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const property = await prisma.property.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updated = await prisma.property.update({
      where: { id: parseInt(id) },
      data: { name, description }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await prisma.property.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
};
