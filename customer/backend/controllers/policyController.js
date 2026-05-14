const supabase = require('../config/supabase');

const VALID_TABLES = {
  privacy: 'privacy_sections',
  terms: 'terms_sections',
  help: 'help_sections'
};

// GET /api/policies/:type — public, no auth needed
async function getSections(req, res, next) {
  try {
    const table = VALID_TABLES[req.params.type];
    if (!table) return res.status(400).json({ success: false, message: 'Invalid policy type' });

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('sortorder', { ascending: true });

    if (error) return res.status(500).json({ success: false, message: 'Failed to fetch sections' });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/policies/:type/:id — admin only
async function updateSection(req, res, next) {
  try {
    const table = VALID_TABLES[req.params.type];
    if (!table) return res.status(400).json({ success: false, message: 'Invalid policy type' });

    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required' });

    const { error } = await supabase
      .from(table)
      .update({ title, content, updatedat: new Date().toISOString() })
      .eq('sectionid', parseInt(req.params.id));

    if (error) return res.status(500).json({ success: false, message: 'Failed to update section' });
    res.json({ success: true, message: 'Section updated' });
  } catch (err) {
    next(err);
  }
}

// POST /api/policies/:type — admin only
async function addSection(req, res, next) {
  try {
    const table = VALID_TABLES[req.params.type];
    if (!table) return res.status(400).json({ success: false, message: 'Invalid policy type' });

    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required' });

    // Get the highest sortorder
    const { data: existing } = await supabase
      .from(table)
      .select('sortorder')
      .order('sortorder', { ascending: false })
      .limit(1);

    const nextOrder = (existing && existing.length > 0) ? existing[0].sortorder + 1 : 1;

    const { data, error } = await supabase
      .from(table)
      .insert({ title, content, sortorder: nextOrder })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, message: 'Failed to add section' });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/policies/:type/:id — admin only
async function deleteSection(req, res, next) {
  try {
    const table = VALID_TABLES[req.params.type];
    if (!table) return res.status(400).json({ success: false, message: 'Invalid policy type' });

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('sectionid', parseInt(req.params.id));

    if (error) return res.status(500).json({ success: false, message: 'Failed to delete section' });
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSections, updateSection, addSection, deleteSection };
