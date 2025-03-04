// server/controllers/partnerController.js

const Partner = require('../models/Partner');

exports.getPartnerById = async (req, res) => {
  try {
    // If you want to ensure only that partner or an admin can view this, check req.user.id or req.user.role
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ error: 'Server error fetching partner' });
  }
};

exports.updatePartner = async (req, res) => {
  try {
    // If you want to ensure only that partner can update their data:
    // if (req.user.role !== 'partner' || req.user.id !== req.params.id) ...
    const { id } = req.params;
    const updatedPartner = await Partner.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPartner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json({ message: 'Partner updated successfully', partner: updatedPartner });
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(400).json({ error: 'Failed to update partner' });
  }
};
