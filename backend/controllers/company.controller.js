const Company = require('../models/Company');

// @desc    Get company details
// @route   GET /api/companies/:id
// @access  Private
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('admin', 'name email');

    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Admin)
exports.updateCompany = async (req, res) => {
  try {
    const { name, country, currency } = req.body;

    let company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }

    company.name = name || company.name;
    company.country = country || company.country;
    company.currency = currency || company.currency;

    await company.save();

    res.json({
      success: true,
      company
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
