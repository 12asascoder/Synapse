require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const db = require('./models');

const bootcamps = [
  { name: 'AI Engineering', slug: 'ai-engineering', description: 'Master AI systems from foundations to deployment.', icon: 'Brain', duration: '30 Days', level: 'Advanced', color: '#6366f1', outcomes: ['Build production AI systems', 'Master LLMs & RAG', 'Deploy at scale'], cert: true },
  { name: 'Frontend Engineering', slug: 'frontend-engineering', description: 'Build beautiful, performant web interfaces.', icon: 'Monitor', duration: '24 Days', level: 'Intermediate', color: '#06b6d4', outcomes: ['React mastery', 'Responsive design', 'Web performance'], cert: true },
  { name: 'Backend Engineering', slug: 'backend-engineering', description: 'Design scalable server-side systems.', icon: 'Server', duration: '28 Days', level: 'Intermediate', color: '#10b981', outcomes: ['API design', 'Database mastery', 'System architecture'], cert: true },
  { name: 'Product Management', slug: 'product-management', description: 'Lead products from idea to launch.', icon: 'Rocket', duration: '21 Days', level: 'Beginner', color: '#f59e0b', outcomes: ['Roadmap planning', 'User research', 'Go-to-market strategy'], cert: true },
  { name: 'Data Science', slug: 'data-science', description: 'Extract insights from data with statistical rigor.', icon: 'BarChart3', duration: '30 Days', level: 'Advanced', color: '#8b5cf6', outcomes: ['Statistical analysis', 'ML modeling', 'Data visualization'], cert: true },
  { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Protect systems and networks from threats.', icon: 'Shield', duration: '26 Days', level: 'Intermediate', color: '#ef4444', outcomes: ['Threat detection', 'Network security', 'Incident response'], cert: true },
  { name: 'DevOps', slug: 'devops', description: 'Automate and streamline infrastructure.', icon: 'Container', duration: '24 Days', level: 'Intermediate', color: '#14b8a6', outcomes: ['CI/CD pipelines', 'Container orchestration', 'Infrastructure as code'], cert: true },
  { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'Craft intuitive, delightful user experiences.', icon: 'Palette', duration: '20 Days', level: 'Beginner', color: '#ec4899', outcomes: ['Design systems', 'User testing', 'Prototyping'], cert: true },
  { name: 'Cloud Engineering', slug: 'cloud-engineering', description: 'Design and manage cloud infrastructure.', icon: 'Cloud', duration: '28 Days', level: 'Advanced', color: '#3b82f6', outcomes: ['AWS/Azure/GCP', 'Serverless architecture', 'Cost optimization'], cert: true },
  { name: 'Sales Engineering', slug: 'sales-engineering', description: 'Bridge technical products and customer needs.', icon: 'Handshake', duration: '18 Days', level: 'Beginner', color: '#22c55e', outcomes: ['Technical demos', 'Solution consulting', 'CRM mastery'], cert: true },
];

const curriculumDays = [
  { day: 1, topic: 'Introduction to AI Systems', sublabel: 'AI Foundations', description: 'Overview of AI, ML, and deep learning.' },
  { day: 2, topic: 'Machine Learning Basics', sublabel: 'Supervised Learning', description: 'Regression, classification, and evaluation.' },
  { day: 3, topic: 'Deep Learning Architectures', sublabel: 'Neural Networks', description: 'Perceptrons, activation functions, and layers.' },
  { day: 4, topic: 'Data Preprocessing', sublabel: 'Data Pipelines', description: 'Cleaning, transforming, and augmenting data.' },
  { day: 5, topic: 'Backpropagation', sublabel: 'Gradient Descent', description: 'Training neural networks with backprop.' },
  { day: 6, topic: 'Convolutional Neural Networks', sublabel: 'Computer Vision', description: 'CNNs for image recognition tasks.' },
  { day: 7, topic: 'Recurrent Neural Networks', sublabel: 'Sequence Modeling', description: 'RNNs, LSTMs, and GRUs for sequences.' },
  { day: 8, topic: 'Natural Language Processing', sublabel: 'Text Representation', description: 'Tokenization, embeddings, and transformers.' },
  { day: 9, topic: 'Transformers', sublabel: 'Attention Mechanisms', description: 'Self-attention and transformer architecture.' },
  { day: 10, topic: 'Large Language Models', sublabel: 'Generative AI', description: 'GPT, Llama, and foundation models.' },
  { day: 11, topic: 'Prompt Engineering', sublabel: 'Context Optimization', description: 'Crafting effective prompts for LLMs.' },
  { day: 12, topic: 'Model Evaluation', sublabel: 'Metrics & Testing', description: 'Evaluating model performance and bias.' },
  { day: 13, topic: 'Transfer Learning', sublabel: 'Fine-tuning Basics', description: 'Adapting pretrained models to new tasks.' },
  { day: 14, topic: 'Optimization Strategies', sublabel: 'LoRA & QLoRA', description: 'Parameter-efficient fine-tuning methods.' },
  { day: 15, topic: 'Mid-Term Programming Assessment', sublabel: 'Phase 1 Validation', description: 'Coding assessment covering weeks 1-2.', contentType: 'assessment' },
  { day: 16, topic: 'RAG Architecture', sublabel: 'Vector Databases', description: 'Retrieval-augmented generation pipelines.' },
  { day: 17, topic: 'Embeddings Deep Dive', sublabel: 'Similarity Search', description: 'Vector embeddings and semantic search.' },
  { day: 18, topic: 'AI Agents', sublabel: 'Autonomous Systems', description: 'Building autonomous AI agents.' },
  { day: 19, topic: 'Tool Use & APIs', sublabel: 'Agent Capabilities', description: 'Tools, function calling, and API integration.' },
  { day: 20, topic: 'LangChain & LlamaIndex', sublabel: 'Frameworks', description: 'Popular LLM application frameworks.' },
  { day: 21, topic: 'Distributed Systems', sublabel: 'Scaling AI', description: 'Distributed training and inference.' },
  { day: 22, topic: 'MLOps Foundations', sublabel: 'Deployment', description: 'ML pipelines and model deployment.' },
  { day: 23, topic: 'Model Serving', sublabel: 'Inference at Scale', description: 'Serving models in production.' },
  { day: 24, topic: 'Monitoring & Logging', sublabel: 'Observability', description: 'Monitoring model performance and drift.' },
  { day: 25, topic: 'AI Security', sublabel: 'Adversarial Attacks', description: 'Securing AI systems against attacks.' },
  { day: 26, topic: 'Ethics & Bias', sublabel: 'Responsible AI', description: 'Fairness, accountability, and transparency.' },
  { day: 27, topic: 'Reinforcement Learning', sublabel: 'Reward Systems', description: 'RL fundamentals and reward modeling.' },
  { day: 28, topic: 'Multimodal Models', sublabel: 'Vision & Text', description: 'Models that process multiple modalities.' },
  { day: 29, topic: 'Future of AI', sublabel: 'Emerging Trends', description: 'Frontier research and industry trends.' },
  { day: 30, topic: 'Final Technical Interview', sublabel: 'Certification Day', description: 'Comprehensive final assessment.', contentType: 'assessment' },
];

const assessmentQuestions = [
  {
    question: 'What is the primary advantage of using LoRA for fine-tuning large language models?',
    options: ['It trains all parameters from scratch', 'It only trains a small set of rank-decomposition matrices, reducing memory usage', 'It requires no training data', 'It doubles the model size for better accuracy'],
    correctAnswer: 1,
    explanation: 'LoRA (Low-Rank Adaptation) freezes pretrained weights and injects trainable rank-decomposition matrices, dramatically reducing the number of trainable parameters.',
    topic: 'fine-tuning',
    difficulty: 'medium',
  },
  {
    question: 'In a RAG system, what is the role of the embedding model?',
    options: ['To generate the final answer', 'To convert text into dense vector representations for semantic search', 'To rank search results by date', 'To compress the input prompt'],
    correctAnswer: 1,
    explanation: 'Embedding models convert text into fixed-size vectors that capture semantic meaning, enabling similarity search in vector databases.',
    topic: 'rag',
    difficulty: 'medium',
  },
  {
    question: 'What does the attention mechanism in Transformers compute?',
    options: ['The average of all input tokens', 'Relevance scores between each pair of tokens in a sequence', 'The gradient of the loss function', 'The frequency of each word in the corpus'],
    correctAnswer: 1,
    explanation: 'Self-attention computes attention scores between every pair of positions in the input, allowing the model to weigh the importance of different tokens.',
    topic: 'transformers',
    difficulty: 'easy',
  },
  {
    question: 'What is the main purpose of a vector database in an AI system?',
    options: ['To store relational data with foreign keys', 'To enable efficient similarity search over high-dimensional embeddings', 'To cache HTTP responses', 'To manage user authentication'],
    correctAnswer: 1,
    explanation: 'Vector databases like Pinecone, Weaviate, and Milvus are optimized for storing and searching vector embeddings using approximate nearest neighbor algorithms.',
    topic: 'rag',
    difficulty: 'medium',
  },
  {
    question: 'What is the difference between bagging and boosting in ensemble learning?',
    options: ['Bagging trains models sequentially, boosting trains in parallel', 'Bagging trains models independently, boosting corrects previous errors sequentially', 'There is no difference', 'Bagging is only for regression, boosting is for classification'],
    correctAnswer: 1,
    explanation: 'Bagging (like Random Forest) trains models in parallel on bootstrap samples. Boosting (like XGBoost) trains models sequentially, each correcting errors from the previous.',
    topic: 'machine-learning',
    difficulty: 'hard',
  },
  {
    question: 'What is the purpose of dropout in neural networks?',
    options: ['To increase training speed', 'To randomly drop neurons during training to prevent overfitting', 'To reduce the number of layers', 'To normalize input data'],
    correctAnswer: 1,
    explanation: 'Dropout randomly sets a fraction of neurons to zero during training, preventing co-adaptation and acting as a regularization technique.',
    topic: 'deep-learning',
    difficulty: 'easy',
  },
  {
    question: 'What does the temperature parameter control in LLM text generation?',
    options: ['The length of the generated text', 'The randomness of token sampling — higher values produce more diverse output', 'The speed of inference', 'The memory usage of the model'],
    correctAnswer: 1,
    explanation: 'Temperature scales the logit probabilities before sampling. Low temperature (0.1) makes output deterministic; high temperature (1.0+) increases diversity.',
    topic: 'llm',
    difficulty: 'medium',
  },
  {
    question: 'What is the primary benefit of using pgvector with PostgreSQL for AI applications?',
    options: ['It replaces the need for a separate vector database by adding vector similarity search directly in PostgreSQL', 'It encrypts all data at rest', 'It compresses storage by 10x', 'It automatically generates embeddings for text columns'],
    correctAnswer: 0,
    explanation: 'pgvector extends PostgreSQL with vector similarity search capabilities, eliminating the need for a separate vector database service.',
    topic: 'rag',
    difficulty: 'medium',
  },
  {
    question: 'In reinforcement learning, what is the exploration-exploitation tradeoff?',
    options: ['Choosing between training on old data vs new data', 'Deciding whether to try new actions to discover better rewards or exploit known high-reward actions', 'Balancing CPU vs GPU usage', 'Choosing the learning rate'],
    correctAnswer: 1,
    explanation: 'The agent must balance exploring new actions to discover potentially better rewards (exploration) versus choosing actions known to yield good rewards (exploitation).',
    topic: 'reinforcement-learning',
    difficulty: 'hard',
  },
  {
    question: 'What is chain-of-thought prompting?',
    options: ['Prompting the model to generate intermediate reasoning steps before answering', 'Running multiple prompts in sequence', 'Chaining multiple LLMs together', 'A type of model architecture'],
    correctAnswer: 0,
    explanation: 'Chain-of-thought prompting instructs the model to break down complex reasoning into step-by-step intermediate steps, improving accuracy on multi-step problems.',
    topic: 'prompt-engineering',
    difficulty: 'easy',
  },
];

const achievements = [
  { name: 'First Steps', slug: 'first-steps', description: 'Complete your first lesson', icon: 'Footprints', color: '#6366f1', criteria: { lessonsCompleted: 1 } },
  { name: 'Streak Master', slug: 'streak-master', description: 'Maintain a 7-day learning streak', icon: 'Flame', color: '#f59e0b', criteria: { streak: 7 } },
  { name: 'Knowledge Seeker', slug: 'knowledge-seeker', description: 'Score 80+ on any assessment', icon: 'Trophy', color: '#fbbf24', criteria: { assessmentScore: 80 } },
  { name: 'Halfway There', slug: 'halfway-there', description: 'Complete day 15 of the bootcamp', icon: 'Flag', color: '#10b981', criteria: { currentDay: 15 } },
  { name: 'Graduate', slug: 'graduate', description: 'Complete all 30 days of the bootcamp', icon: 'GraduationCap', color: '#8b5cf6', criteria: { currentDay: 30 } },
  { name: 'Quick Learner', slug: 'quick-learner', description: 'Complete 5 lessons in one day', icon: 'Zap', color: '#06b6d4', criteria: { lessonsInDay: 5 } },
  { name: 'Top Performer', slug: 'top-performer', description: 'Score 95+ on any assessment', icon: 'Star', color: '#ec4899', criteria: { assessmentScore: 95 } },
  { name: 'Community Contributor', slug: 'community-contributor', description: 'Post 10 discussions in the community', icon: 'MessageCircle', color: '#14b8a6', criteria: { discussions: 10 } },
];

async function seed() {
  try {
    await db.sequelize.sync({ force: true });
    console.log('[Seed] Database synced.');

    const existingBootcamps = await db.Bootcamp.count();
    if (existingBootcamps > 0) {
      console.log('[Seed] Data already exists, skipping seed.');
      process.exit(0);
    }

    const createdBootcamps = await db.Bootcamp.bulkCreate(bootcamps);
    console.log(`[Seed] Created ${createdBootcamps.length} bootcamps.`);

    const aiBootcamp = createdBootcamps.find((b) => b.slug === 'ai-engineering');
    const curriculumWithBootcamp = curriculumDays.map((d) => ({ ...d, bootcampId: aiBootcamp.id }));
    await db.CurriculumDay.bulkCreate(curriculumWithBootcamp);
    console.log(`[Seed] Created ${curriculumWithBootcamp.length} curriculum days.`);

    await db.AssessmentQuestion.bulkCreate(assessmentQuestions);
    console.log(`[Seed] Created ${assessmentQuestions.length} assessment questions.`);

    await db.Achievement.bulkCreate(achievements);
    console.log(`[Seed] Created ${achievements.length} achievements.`);

    const hashedPassword = await bcrypt.hash('admin123', 12);
    await db.User.create({
      name: 'Admin',
      email: 'admin@synapse.ai',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      tier: 'Admin',
      points: 99999,
    });
    console.log('[Seed] Created admin user (admin@synapse.ai / admin123).');

    console.log('[Seed] Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error);
    process.exit(1);
  }
}

seed();
