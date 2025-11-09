const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const getDebtors = async (req, res) => {
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

    const debtors = await prisma.debtor.findMany({
      where: { propertyId: parseInt(propertyId) },
      include: {
        payments: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Calculate balance for each debtor
    const debtorsWithBalance = debtors.map(debtor => {
      const totalPaid = debtor.payments.reduce((sum, payment) =>
        sum + parseFloat(payment.amount), 0);
      return {
        ...debtor,
        totalPaid,
        payments: debtor.payments
      };
    });

    res.json(debtorsWithBalance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createDebtor = async (req, res) => {
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

    const debtor = await prisma.debtor.create({
      data: {
        name,
        propertyId: parseInt(propertyId)
      },
      include: {
        payments: true
      }
    });

    res.status(201).json(debtor);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Debtor already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateDebtor = async (req, res) => {
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

    const debtor = await prisma.debtor.findFirst({
      where: {
        id: parseInt(id),
        propertyId: parseInt(propertyId)
      }
    });

    if (!debtor) {
      return res.status(404).json({ error: 'Debtor not found' });
    }

    const updated = await prisma.debtor.update({
      where: { id: parseInt(id) },
      data: { name },
      include: {
        payments: true
      }
    });

    res.json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Debtor already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteDebtor = async (req, res) => {
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

    const debtor = await prisma.debtor.findFirst({
      where: {
        id: parseInt(id),
        propertyId: parseInt(propertyId)
      }
    });

    if (!debtor) {
      return res.status(404).json({ error: 'Debtor not found' });
    }

    await prisma.debtor.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Debtor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getDebtors,
  createDebtor,
  updateDebtor,
  deleteDebtor
};
