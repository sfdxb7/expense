const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
const prisma = require('../lib/prisma');

const getExpenses = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate, categoryId } = req.query;

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

    const where = { propertyId: parseInt(propertyId) };

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true
      },
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId } = req.params;
    const { date, amount, description, categoryId } = req.body;

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

    // Verify category belongs to property
    const category = await prisma.category.findFirst({
      where: {
        id: parseInt(categoryId),
        propertyId: parseInt(propertyId)
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const receiptPath = req.file ? `/uploads/${req.file.filename}` : null;

    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        amount: parseFloat(amount),
        description,
        categoryId: parseInt(categoryId),
        propertyId: parseInt(propertyId),
        receiptPath
      },
      include: {
        category: true
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, id } = req.params;
    const { date, amount, description, categoryId } = req.body;

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

    const expense = await prisma.expense.findFirst({
      where: {
        id: parseInt(id),
        propertyId: parseInt(propertyId)
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Verify category belongs to property
    const category = await prisma.category.findFirst({
      where: {
        id: parseInt(categoryId),
        propertyId: parseInt(propertyId)
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const data = {
      date: new Date(date),
      amount: parseFloat(amount),
      description,
      categoryId: parseInt(categoryId)
    };

    // Handle receipt upload
    if (req.file) {
      // Delete old receipt if exists
      if (expense.receiptPath) {
        const oldPath = path.join(__dirname, '../../', expense.receiptPath);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          // File doesn't exist or error deleting, continue anyway
          console.warn('Could not delete old receipt:', err.message);
        }
      }
      data.receiptPath = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.expense.update({
      where: { id: parseInt(id) },
      data,
      include: {
        category: true
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteExpense = async (req, res) => {
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

    const expense = await prisma.expense.findFirst({
      where: {
        id: parseInt(id),
        propertyId: parseInt(propertyId)
      }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete receipt file if exists
    if (expense.receiptPath) {
      const receiptPath = path.join(__dirname, '../../', expense.receiptPath);
      try {
        await fs.unlink(receiptPath);
      } catch (err) {
        // File doesn't exist or error deleting, continue anyway
        console.warn('Could not delete receipt:', err.message);
      }
    }

    await prisma.expense.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};
