const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const getPayments = async (req, res) => {
  try {
    const { debtorId } = req.params;

    // Verify debtor belongs to user's property
    const debtor = await prisma.debtor.findFirst({
      where: { id: parseInt(debtorId) },
      include: {
        property: true
      }
    });

    if (!debtor || debtor.property.userId !== req.userId) {
      return res.status(404).json({ error: 'Debtor not found' });
    }

    const payments = await prisma.payment.findMany({
      where: { debtorId: parseInt(debtorId) },
      orderBy: { date: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { debtorId } = req.params;
    const { amount, date, notes } = req.body;

    // Verify debtor belongs to user's property
    const debtor = await prisma.debtor.findFirst({
      where: { id: parseInt(debtorId) },
      include: {
        property: true
      }
    });

    if (!debtor || debtor.property.userId !== req.userId) {
      return res.status(404).json({ error: 'Debtor not found' });
    }

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        notes,
        debtorId: parseInt(debtorId)
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updatePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { debtorId, id } = req.params;
    const { amount, date, notes } = req.body;

    // Verify payment belongs to user's debtor
    const payment = await prisma.payment.findFirst({
      where: { id: parseInt(id) },
      include: {
        debtor: {
          include: {
            property: true
          }
        }
      }
    });

    if (!payment || payment.debtor.property.userId !== req.userId) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const updated = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        amount: parseFloat(amount),
        date: new Date(date),
        notes
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { debtorId, id } = req.params;

    // Verify payment belongs to user's debtor
    const payment = await prisma.payment.findFirst({
      where: { id: parseInt(id) },
      include: {
        debtor: {
          include: {
            property: true
          }
        }
      }
    });

    if (!payment || payment.debtor.property.userId !== req.userId) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await prisma.payment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
};
