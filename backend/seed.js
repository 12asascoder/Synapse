require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const db = require('./models');

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
  { name: 'Quick Learner', slug: 'quick-learner', description: 'Complete 5 lessons in one day', icon: 'Zap', color: '#06b6d4', criteria: { lessonsInDay: 5 } },
  { name: 'Top Performer', slug: 'top-performer', description: 'Score 95+ on any assessment', icon: 'Star', color: '#ec4899', criteria: { assessmentScore: 95 } },
  { name: 'Community Contributor', slug: 'community-contributor', description: 'Post 10 discussions in the community', icon: 'MessageCircle', color: '#14b8a6', criteria: { discussions: 10 } },
];

async function seed() {
  try {
    await db.sequelize.sync({ force: true });
    console.log('[Seed] Database synced.');

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
