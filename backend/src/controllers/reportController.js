const prisma = require('../lib/prisma');

const getReport = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: parseInt(propertyId),
        userId: req.userId
      },
      include: {
        categories: true,
        debtors: {
          include: {
            payments: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        propertyId: parseInt(propertyId),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
      },
      include: {
        category: true
      },
      orderBy: { date: 'asc' }
    });

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) =>
      sum + parseFloat(expense.amount), 0);

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: categoryName,
          total: 0,
          count: 0
        };
      }
      acc[categoryName].total += parseFloat(expense.amount);
      acc[categoryName].count += 1;
      return acc;
    }, {});

    // Calculate debtor balances
    const debtorBalances = property.debtors.map(debtor => {
      // Filter payments by date if applicable
      let payments = debtor.payments;
      if (Object.keys(dateFilter).length > 0) {
        payments = payments.filter(payment => {
          const paymentDate = new Date(payment.date);
          if (dateFilter.gte && paymentDate < dateFilter.gte) return false;
          if (dateFilter.lte && paymentDate > dateFilter.lte) return false;
          return true;
        });
      }

      const totalPaid = payments.reduce((sum, payment) =>
        sum + parseFloat(payment.amount), 0);

      return {
        debtor: debtor.name,
        totalPaid,
        paymentCount: payments.length
      };
    });

    const totalPayments = debtorBalances.reduce((sum, d) => sum + d.totalPaid, 0);
    const netBalance = totalExpenses - totalPayments;

    const report = {
      property: {
        id: property.id,
        name: property.name
      },
      period: {
        startDate: startDate || 'Beginning',
        endDate: endDate || 'Now'
      },
      summary: {
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        totalPayments: parseFloat(totalPayments.toFixed(2)),
        netBalance: parseFloat(netBalance.toFixed(2)),
        expenseCount: expenses.length
      },
      expensesByCategory: Object.values(expensesByCategory).map(cat => ({
        ...cat,
        total: parseFloat(cat.total.toFixed(2))
      })),
      debtorBalances,
      expenses: expenses.map(e => ({
        id: e.id,
        date: e.date,
        amount: parseFloat(e.amount),
        category: e.category.name,
        description: e.description
      }))
    };

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getYearlyReport = async (req, res) => {
  try {
    const { propertyId, year } = req.params;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    req.query.startDate = startDate.toISOString();
    req.query.endDate = endDate.toISOString();

    return getReport(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getReport,
  getYearlyReport
};
