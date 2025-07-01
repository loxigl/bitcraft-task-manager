import express from 'express';
import { TemplateController } from '../controllers/templateController';

const router = express.Router();

// GET /templates - Get all templates
router.get('/', TemplateController.getAllTemplates);

// GET /templates/:templateId - Get template by ID
router.get('/:templateId', TemplateController.getTemplateById);

// POST /templates - Create a new template from a task
router.post('/', TemplateController.createTemplate);

// PUT /templates/:templateId - Update a template
router.put('/:templateId', TemplateController.updateTemplate);

// DELETE /templates/:templateId - Delete a template
router.delete('/:templateId', TemplateController.deleteTemplate);

export default router; 