const express = require('express');
const Skill = require('../models/Skill');
const Company = require('../models/Company');
const { asyncHandler } = require('../utils/helpers');

const router = express.Router();

router.get(
  '/skills',
  asyncHandler(async (req, res) => {
    const [skills, categories] = await Promise.all([
      Skill.list(),
      Skill.categories()
    ]);
    res.json({ success: true, skills, categories });
  })
);

router.get(
  '/companies',
  asyncHandler(async (req, res) => {
    const companies = await Company.list();
    res.json({ success: true, companies });
  })
);

module.exports = router;
