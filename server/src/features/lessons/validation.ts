import Joi from 'joi';

export const validateCreateLesson = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required().messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
    }),
    description: Joi.string().min(10).max(1000).required().messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters',
    }),
    content: Joi.string().required().messages({
      'string.empty': 'Content is required',
    }),
    difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').required().messages({
      'any.only': 'Difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
      'string.empty': 'Difficulty is required',
    }),
    trackId: Joi.string().required().messages({
      'string.empty': 'Track ID is required',
    }),
    slug: Joi.string().required().messages({
      'string.empty': 'Slug is required',
    }),
    estimatedTime: Joi.number().integer().min(1).required().messages({
      'number.base': 'Estimated time must be a number',
      'number.integer': 'Estimated time must be an integer',
      'number.min': 'Estimated time must be at least 1 minute',
    }),
  });

  return schema.validate(data);
};

export const validateUpdateLesson = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).optional().messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
    }),
    description: Joi.string().min(10).max(1000).optional().messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters',
    }),
    content: Joi.string().optional(),
    difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').optional().messages({
      'any.only': 'Difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
    }),
    trackId: Joi.string().optional(),
    slug: Joi.string().optional(),
    estimatedTime: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Estimated time must be a number',
      'number.integer': 'Estimated time must be an integer',
      'number.min': 'Estimated time must be at least 1 minute',
    }),
  });

  return schema.validate(data);
};
