const express = require('express');
const router = express.Router();
const { Progress } = require('../models');

// Mock backend curriculum database
const BOOTCAMP_CURRICULUM = [
  { day: 1, topic: 'Introduction to AI Systems', sublabel: 'AI Foundations' },
  { day: 2, topic: 'Machine Learning Basics', sublabel: 'Supervised Learning' },
  { day: 3, topic: 'Deep Learning Architectures', sublabel: 'Neural Networks' },
  { day: 4, topic: 'Data Preprocessing', sublabel: 'Data Pipelines' },
  { day: 5, topic: 'Backpropagation', sublabel: 'Gradient Descent' },
  { day: 6, topic: 'Convolutional Neural Networks', sublabel: 'Computer Vision' },
  { day: 7, topic: 'Recurrent Neural Networks', sublabel: 'Sequence Modeling' },
  { day: 8, topic: 'Natural Language Processing', sublabel: 'Text Representation' },
  { day: 9, topic: 'Transformers', sublabel: 'Attention Mechanisms' },
  { day: 10, topic: 'Large Language Models', sublabel: 'Generative AI' },
  { day: 11, topic: 'Prompt Engineering', sublabel: 'Context Optimization' },
  { day: 12, topic: 'Model Evaluation', sublabel: 'Metrics & Testing' },
  { day: 13, topic: 'Transfer Learning', sublabel: 'Fine-tuning Basics' },
  { day: 14, topic: 'Optimization Strategies', sublabel: 'LoRA & QLoRA' },
  { day: 15, topic: 'Mid-Term Programming Assessment', sublabel: 'Phase 1 Validation' },
  { day: 16, topic: 'RAG Architecture', sublabel: 'Vector Databases' },
  { day: 17, topic: 'Embeddings Deep Dive', sublabel: 'Similarity Search' },
  { day: 18, topic: 'AI Agents', sublabel: 'Autonomous Systems' },
  { day: 19, topic: 'Tool Use & APIs', sublabel: 'Agent Capabilities' },
  { day: 20, topic: 'LangChain & LlamaIndex', sublabel: 'Frameworks' },
  { day: 21, topic: 'Distributed Systems', sublabel: 'Scaling AI' },
  { day: 22, topic: 'MLOps Foundations', sublabel: 'Deployment' },
  { day: 23, topic: 'Model Serving', sublabel: 'Inference at Scale' },
  { day: 24, topic: 'Monitoring & Logging', sublabel: 'Observability' },
  { day: 25, topic: 'AI Security', sublabel: 'Adversarial Attacks' },
  { day: 26, topic: 'Ethics & Bias', sublabel: 'Responsible AI' },
  { day: 27, topic: 'Reinforcement Learning', sublabel: 'Reward Systems' },
  { day: 28, topic: 'Multimodal Models', sublabel: 'Vision & Text' },
  { day: 29, topic: 'Future of AI', sublabel: 'Emerging Trends' },
  { day: 30, topic: 'Final Technical Interview', sublabel: 'Certification Day' },
];

router.get('/:userId', async (req, res) => {
  try {
    const progress = await Progress.findOne({ where: { userId: req.params.userId } });
    if (!progress) return res.status(404).json({ error: 'Progress not found' });

    // Enhance curriculum with user status
    const currentDay = progress.currentDay;
    const curriculumWithStatus = BOOTCAMP_CURRICULUM.map((item) => {
      let status = 'locked';
      if (item.day < currentDay) status = 'complete';
      else if (item.day === currentDay) status = 'active';
      return { ...item, status };
    });

    res.json(curriculumWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
