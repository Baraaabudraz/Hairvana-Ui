const { Salon } = require('../../../models');
const { getFileInfo } = require('../../../helpers/uploadHelper');

exports.getSalonProfile = async (req, res) => {
  try {
    const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    return res.json({ success: true, salon });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch salon profile' });
  }
};

exports.updateSalonProfile = async (req, res) => {
  try {
    const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
    if (!salon) return res.status(404).json({ error: 'Salon not found' });
    const { name, phone, address, location, website, description, business_license, tax_id, hours } = req.body;
    if (name) salon.name = name;
    if (phone) salon.phone = phone;
    if (address) salon.address = address;
    if (location) salon.location = location;
    if (website) salon.website = website;
    if (description) salon.description = description;
    if (business_license) salon.business_license = business_license;
    if (tax_id) salon.tax_id = tax_id;
    if (hours) salon.hours = hours;
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      // Store only filenames in DB
      salon.images = req.files.map(file => getFileInfo(file, '/uploads/salons').storedName);
    } else if (req.body.images) {
      // If images are sent as a JSON array in the body (for non-upload updates)
      salon.images = req.body.images;
    }
    await salon.save();
    // Return full URLs in the response
    const baseUrl = req.protocol + '://' + req.get('host');
    const images = (salon.images || []).map(filename => baseUrl + '/uploads/salons/' + filename);
    return res.json({ success: true, salon: { ...salon.toJSON(), images } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update salon profile' });
  }
}; 