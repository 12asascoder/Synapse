const express = require('express');
const router = express.Router();
const { DSAAttempt, WeakTopic, InterviewPrep } = require('../models');
const { authenticate } = require('../middleware/auth');
const { trugenGenerate } = require('../ai/trugen');

const DSA_TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
  'Trees', 'Graphs', 'Dynamic Programming', 'Recursion',
  'Sorting', 'Searching', 'Hash Tables', 'Heaps', 'Tries',
  'Bit Manipulation', 'Math', 'Greedy', 'Backtracking',
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const FREQUENCIES = ['most-asked', 'frequently-asked', 'occasionally-asked'];

const COMPANY_DSA_QUESTIONS = {
  google: [
    { id: 'g1', title: 'Two Sum', topic: 'Arrays', difficulty: 'easy', frequency: 'most-asked', description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.', examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }] },
    { id: 'g2', title: 'Longest Substring Without Repeating Characters', topic: 'Strings', difficulty: 'medium', frequency: 'most-asked', description: 'Given a string s, find the length of the longest substring without repeating characters.', examples: [{ input: 's = "abcabcbb"', output: '3' }] },
    { id: 'g3', title: 'Merge K Sorted Lists', topic: 'Linked Lists', difficulty: 'hard', frequency: 'most-asked', description: 'You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all into one sorted list.', examples: [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }] },
    { id: 'g4', title: 'Serialize and Deserialize Binary Tree', topic: 'Trees', difficulty: 'hard', frequency: 'frequently-asked', description: 'Design an algorithm to serialize and deserialize a binary tree.', examples: [{ input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' }] },
    { id: 'g5', title: 'LRU Cache', topic: 'Hash Tables', difficulty: 'medium', frequency: 'most-asked', description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.', examples: [{ input: 'LRUCache cache = new LRUCache(2); cache.put(1,1); cache.put(2,2); cache.get(1)', output: '1' }] },
    { id: 'g6', title: 'Trapping Rain Water', topic: 'Arrays', difficulty: 'hard', frequency: 'most-asked', description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.', examples: [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }] },
    { id: 'g7', title: 'Word Ladder', topic: 'Graphs', difficulty: 'hard', frequency: 'frequently-asked', description: 'Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence.', examples: [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' }] },
    { id: 'g8', title: 'Find Median from Data Stream', topic: 'Heaps', difficulty: 'hard', frequency: 'most-asked', description: 'The median is the middle value in an ordered integer list. Implement the MedianFinder class.', examples: [{ input: 'addNum(1), addNum(2), findMedian()', output: '1.5' }] },
    { id: 'g9', title: 'Number of Islands', topic: 'Graphs', difficulty: 'medium', frequency: 'most-asked', description: 'Given an m x n 2D binary grid representing a map of "1"s (land) and "0"s (water), return the number of islands.', examples: [{ input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"]]', output: '1' }] },
    { id: 'g10', title: 'Longest Increasing Path in a Matrix', topic: 'Dynamic Programming', difficulty: 'hard', frequency: 'frequently-asked', description: 'Given an m x n integers matrix, return the length of the longest increasing path.', examples: [{ input: 'matrix = [[9,9,4],[6,6,8],[2,1,1]]', output: '4' }] },
  ],
  amazon: [
    { id: 'a1', title: 'Two Sum', topic: 'Arrays', difficulty: 'easy', frequency: 'most-asked', description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.', examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }] },
    { id: 'a2', title: 'Rotting Oranges', topic: 'Graphs', difficulty: 'medium', frequency: 'most-asked', description: 'You are given an m x n grid where each cell can have one of three values. Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.', examples: [{ input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' }] },
    { id: 'a3', title: 'Design Tic-Tac-Toe', topic: 'Arrays', difficulty: 'medium', frequency: 'frequently-asked', description: 'Design a Tic-tac-toe game that is played between two players on an n x n grid.', examples: [{ input: 'move(0,0,1), move(0,2,2), move(2,2,1), move(1,1,2), move(2,0,1)', output: 'Player 1 wins' }] },
    { id: 'a4', title: 'Copy List with Random Pointer', topic: 'Linked Lists', difficulty: 'medium', frequency: 'most-asked', description: 'A linked list of length n is given such that each node contains an additional random pointer. Construct a deep copy.', examples: [{ input: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', output: '[[7,null],[13,0],[11,4],[10,2],[1,0]]' }] },
    { id: 'a5', title: 'Analyze User Website Visit Pattern', topic: 'Hash Tables', difficulty: 'medium', frequency: 'frequently-asked', description: 'You are given arrays timestamp, username, and website. Find the most visited three-page sequence.', examples: [{ input: 'username = ["joe","joe","joe"], timestamp = [1,2,3], website = ["home","about","career"]', output: '["home","about","career"]' }] },
    { id: 'a6', title: 'Top K Frequent Words', topic: 'Hash Tables', difficulty: 'medium', frequency: 'most-asked', description: 'Given an array of strings words and an integer k, return the k most frequent strings.', examples: [{ input: 'words = ["i","love","leetcode","i","love","coding"], k = 2', output: '["i","love"]' }] },
    { id: 'a7', title: 'Maximum Subarray', topic: 'Dynamic Programming', difficulty: 'medium', frequency: 'most-asked', description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.', examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }] },
  ],
  microsoft: [
    { id: 'm1', title: 'Reverse Linked List', topic: 'Linked Lists', difficulty: 'easy', frequency: 'most-asked', description: 'Given the head of a singly linked list, reverse the list.', examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }] },
    { id: 'm2', title: 'LRU Cache', topic: 'Hash Tables', difficulty: 'medium', frequency: 'most-asked', description: 'Design a data structure that follows the constraints of an LRU cache.', examples: [{ input: 'LRUCache cache = new LRUCache(2)', output: 'null' }] },
    { id: 'm3', title: 'Design Excel Sum Formula', topic: 'Hash Tables', difficulty: 'hard', frequency: 'frequently-asked', description: 'Design Excel where each cell can contain a number or a formula that references other cells.', examples: [{ input: 'set(1,"A",1), get(1,"A")', output: '1' }] },
    { id: 'm4', title: 'Kth Largest Element in an Array', topic: 'Heaps', difficulty: 'medium', frequency: 'most-asked', description: 'Given an integer array nums and an integer k, return the kth largest element.', examples: [{ input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' }] },
  ],
  meta: [
    { id: 'f1', title: 'Valid Palindrome II', topic: 'Strings', difficulty: 'easy', frequency: 'most-asked', description: 'Given a string s, return true if it can be a palindrome after deleting at most one character.', examples: [{ input: 's = "abca"', output: 'true' }] },
    { id: 'f2', title: 'Binary Tree Level Order Traversal', topic: 'Trees', difficulty: 'medium', frequency: 'most-asked', description: 'Given the root of a binary tree, return the level order traversal of its nodes.', examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }] },
    { id: 'f3', title: 'K Closest Points to Origin', topic: 'Heaps', difficulty: 'medium', frequency: 'most-asked', description: 'Given an array of points, return the k closest points to the origin.', examples: [{ input: 'points = [[1,3],[-2,2]], k = 1', output: '[[-2,2]]' }] },
  ],
  netflix: [
    { id: 'n1', title: 'Design Movie Recommendation System', topic: 'Hash Tables', difficulty: 'hard', frequency: 'frequently-asked', description: 'Design a movie recommendation system based on user preferences and watch history.', examples: [{ input: 'users = [{"id":1,"watched":["m1","m2"]}]', output: '["m3","m4"]' }] },
    { id: 'n2', title: 'Longest Palindromic Substring', topic: 'Strings', difficulty: 'medium', frequency: 'most-asked', description: 'Given a string s, return the longest palindromic substring in s.', examples: [{ input: 's = "babad"', output: '"bab"' }] },
  ],
  apple: [
    { id: 'ap1', title: 'Design In-Memory File System', topic: 'Trees', difficulty: 'hard', frequency: 'frequently-asked', description: 'Design an in-memory file system to simulate basic file operations.', examples: [{ input: 'ls("/"), mkdir("/a/b/c")', output: '[]' }] },
    { id: 'ap2', title: 'Merge Two Sorted Lists', topic: 'Linked Lists', difficulty: 'easy', frequency: 'most-asked', description: 'Merge two sorted linked lists and return it as a sorted list.', examples: [{ input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }] },
  ],
};

function getDefaultQuestions(company) {
  const key = company?.toLowerCase() || '';
  if (COMPANY_DSA_QUESTIONS[key]) return COMPANY_DSA_QUESTIONS[key];
  if (key.includes('google')) return COMPANY_DSA_QUESTIONS.google;
  if (key.includes('amazon')) return COMPANY_DSA_QUESTIONS.amazon;
  if (key.includes('microsoft') || key.includes('msft')) return COMPANY_DSA_QUESTIONS.microsoft;
  if (key.includes('meta') || key.includes('facebook')) return COMPANY_DSA_QUESTIONS.meta;
  if (key.includes('netflix')) return COMPANY_DSA_QUESTIONS.netflix;
  if (key.includes('apple')) return COMPANY_DSA_QUESTIONS.apple;
  return [];
}

router.get('/questions/:prepId', authenticate, async (req, res) => {
  try {
    const prep = await InterviewPrep.findOne({
      where: { id: req.params.prepId, userId: req.user.id },
    });
    if (!prep) return res.status(404).json({ error: 'Prep session not found' });

    const allQuestions = getDefaultQuestions(prep.jdSummary || '');
    const { topic, difficulty, frequency, search } = req.query;

    let filtered = [...allQuestions];
    if (topic) filtered = filtered.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
    if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
    if (frequency) filtered = filtered.filter(q => q.frequency === frequency);
    if (search) filtered = filtered.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));

    const attempts = await DSAAttempt.findAll({
      where: { interviewPrepId: req.params.prepId, userId: req.user.id },
    });
    const solvedMap = {};
    attempts.forEach(a => { solvedMap[a.id] = a; });

    const questionsWithStatus = filtered.map(q => ({
      ...q,
      solved: !!solvedMap[q.id],
      attempt: solvedMap[q.id] || null,
    }));

    res.json({
      questions: questionsWithStatus,
      total: allQuestions.length,
      solved: Object.keys(solvedMap).length,
      topics: [...new Set(allQuestions.map(q => q.topic))].sort(),
      difficulties: DIFFICULTIES,
      frequencies: FREQUENCIES,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/questions/:prepId/attempt', authenticate, async (req, res) => {
  try {
    const { questionId, title, topic, difficulty, frequency, code, language, isSolved, timeTaken } = req.body;
    const prep = await InterviewPrep.findOne({
      where: { id: req.params.prepId, userId: req.user.id },
    });
    if (!prep) return res.status(404).json({ error: 'Prep session not found' });

    const existing = await DSAAttempt.findOne({
      where: { interviewPrepId: req.params.prepId, userId: req.user.id, id: questionId },
    });

    if (existing) {
      await existing.update({
        code: code || existing.code,
        isSolved: isSolved !== undefined ? isSolved : existing.isSolved,
        timeTaken: timeTaken || existing.timeTaken,
        attemptNumber: existing.attemptNumber + 1,
      });
      return res.json(existing);
    }

    const attempt = await DSAAttempt.create({
      interviewPrepId: req.params.prepId,
      userId: req.user.id,
      question: title,
      topic,
      difficulty,
      frequency,
      code: code || '',
      language: language || 'javascript',
      isSolved: !!isSolved,
      timeTaken: timeTaken || 0,
    });

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/progress/:prepId', authenticate, async (req, res) => {
  try {
    const prep = await InterviewPrep.findOne({
      where: { id: req.params.prepId, userId: req.user.id },
    });
    if (!prep) return res.status(404).json({ error: 'Prep session not found' });

    const allQuestions = getDefaultQuestions(prep.jdSummary || '');
    const attempts = await DSAAttempt.findAll({
      where: { interviewPrepId: req.params.prepId, userId: req.user.id },
    });

    const solved = attempts.filter(a => a.isSolved).length;
    const byTopic = {};
    const byDifficulty = { easy: { total: 0, solved: 0 }, medium: { total: 0, solved: 0 }, hard: { total: 0, solved: 0 } };

    allQuestions.forEach(q => {
      byTopic[q.topic] = byTopic[q.topic] || { total: 0, solved: 0 };
      byTopic[q.topic].total++;
      byDifficulty[q.difficulty].total++;
    });

    attempts.forEach(a => {
      if (a.isSolved) {
        byTopic[a.topic] = byTopic[a.topic] || { total: 0, solved: 0 };
        byTopic[a.topic].solved++;
        byDifficulty[a.difficulty] = byDifficulty[a.difficulty] || { total: 0, solved: 0 };
        byDifficulty[a.difficulty].solved++;
      }
    });

    res.json({
      total: allQuestions.length,
      solved,
      remaining: allQuestions.length - solved,
      byTopic: Object.entries(byTopic).map(([topic, data]) => ({ topic, ...data })),
      byDifficulty,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
