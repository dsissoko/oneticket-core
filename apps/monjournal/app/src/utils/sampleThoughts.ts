import { Thought } from '@/models/thoughtModel';

/**
 * Sample thoughts data for initial seeding.
 * This data is only used when localStorage is empty on first visit.
 */
const sampleTitles = [
  'Morning coffee thoughts',
  'Project breakthrough',
  'Reflections on the day',
  'Learning something new',
  'Creative inspiration',
  'Daily gratitude',
  'Problem solved',
  'Interesting conversation',
  'New idea for the future',
  'Personal growth moment',
  'Working towards goals',
  'Unexpected discovery',
  'Productivity boost',
  'Team collaboration',
  'Weekend activities',
  'Reading notes',
  'Travel experience',
  'Skill development',
  'Mindfulness moment',
  'Challenging situation',
  'Success story',
  'Networking opportunity',
  'Code review insights',
  'Design thinking',
  'Career milestone',
  'Hobby time',
  'Family moment',
  'Exercise accomplishment',
  'Writing practice',
  'Music discovery',
  'Art appreciation',
  'Science fact',
  'History lesson',
  'Philosophy thought',
  'Future planning',
  'Risk assessment',
  'Decision making',
  'Relationship advice',
  'Self improvement',
  'Technical debt',
  'Testing strategy',
  'Documentation idea',
  'User experience',
  'Market research',
  'Customer feedback',
  'Competitive analysis',
  'Product roadmap',
  'Feature request',
  'Bug investigation',
  'Performance optimization',
];

const sampleContent = [
  'Started the day with clarity and purpose. The coffee tastes better when you have a plan.',
  'Finally figured out the solution that\'s been bothering me for days. Sometimes you just need to sleep on it.',
  'Today was a good day. Made progress on multiple fronts and helped a colleague with a tricky problem.',
  'Learned about a new framework today. It has some interesting patterns that might be useful for our project.',
  'Had an idea for a side project that could solve a real problem. Need to validate it with users first.',
  'Grateful for the opportunities I have. The team is supportive and the work is meaningful.',
  'Fixed that bug that was causing issues in production. The fix was simpler than expected.',
  'Had a great conversation with someone who challenged my thinking. These interactions are valuable.',
  'What if we approached the problem from a completely different angle? Could lead to innovation.',
  'Spent time in nature today. Helps clear the mind and reduce stress.',
  'Set a new personal record. Hard work and consistency are paying off.',
  'Found a tool that could significantly improve our workflow. Worth exploring further.',
  'Code review revealed some interesting architectural patterns I hadn\'t considered.',
  'Collaborative problem-solving with the team yielded better results than individual efforts.',
  'Took a break from work and recharged. Balance is essential for long-term productivity.',
  'Finished a great book about system design. Lots of takeaways to apply to our architecture.',
  'Visited a new city this weekend. Different perspectives inspire new ideas.',
  'Learned a new programming language that has some elegant concepts.',
  'Took time to meditate and reflect. Clear mind, clear priorities.',
  'Encountered a challenging situation but handled it calmly with data-driven decisions.',
  'Achieved a goal I\'ve been working towards for months. Feels great!',
  'Connected with someone in the industry who offered valuable insights.',
  'Reviewed the team\'s code and learned from their implementations.',
  'Sketched out a user interface flow that feels intuitive and clean.',
  'Got promoted to a new role with more responsibility. Excited about the challenge.',
  'Spent the evening on a hobby project. Creativity outside work is refreshing.',
  'Family dinner was meaningful. Reminded me of what\'s truly important.',
  'Completed a 10km run. Building strength and endurance gradually.',
  'Wrote a thoughtful blog post about best practices. Hope it helps others.',
  'Discovered an amazing new music artist. Art feeds the soul.',
  'Visited a museum and saw inspiring artwork. Different forms of expression matter.',
  'Read an interesting fact about quantum computing. The universe is fascinating.',
  'Learned about a historical event that shaped modern technology.',
  'Contemplated the nature of consciousness. Philosophy is humbling.',
  'Planned my goals for the next quarter. Clear direction is motivating.',
  'Assessed the risks of a new initiative and created a mitigation strategy.',
  'Made a tough decision with incomplete information. Did my best with available data.',
  'Got advice from a mentor about navigating career challenges.',
  'Worked on improving my communication skills. Clear communication is crucial.',
  'Identified and quantified technical debt. Time to address it systematically.',
  'Improved test coverage for critical components. Quality matters.',
  'Updated documentation to reflect recent architectural changes.',
  'Focused on user experience improvements based on feedback.',
  'Analyzed market trends to inform product strategy.',
  'Listened to customer feedback and extracted key insights.',
  'Studied what competitors are doing. Stay aware of the landscape.',
  'Reviewed the product roadmap for the next six months.',
  'Prioritized feature requests based on user impact.',
  'Debugged a subtle race condition. These are the toughest.',
  'Optimized a critical query that improved response time by 40%.',
];

const sampleTags = [
  'work',
  'personal',
  'learning',
  'productivity',
  'ideas',
  'goals',
  'achievement',
  'reflection',
  'growth',
  'morning',
  'evening',
  'technical',
  'design',
  'teamwork',
  'challenge',
  'inspiration',
  'health',
  'art',
  'science',
  'philosophy',
  'travel',
  'family',
  'hobby',
  'reading',
  'writing',
  'code',
  'architecture',
  'testing',
  'performance',
  'user-experience',
  'product',
  'strategy',
  'meeting',
  'breakthrough',
  'decision',
  'relationship',
  'exercise',
  'meditation',
  'gratitude',
];

/**
 * Generate sample thoughts for initial seeding.
 * Creates around 100 thoughts spread from 2017-02-24 to 2026-06-05.
 * Used only when localStorage is empty on first visit.
 */
export function generateSampleThoughts(): Thought[] {
  const thoughts: Thought[] = [];
  const startDate = new Date('2017-02-24').getTime();
  const endDate = new Date('2026-06-05').getTime();
  const dateRange = endDate - startDate;

  // Generate 100 sample thoughts
  for (let i = 0; i < 100; i++) {
    // Distribute thoughts across the date range
    const randomDate = startDate + Math.random() * dateRange;

    // Pick random title and content
    const titleIndex = Math.floor(Math.random() * sampleTitles.length);
    const contentIndex = Math.floor(Math.random() * sampleContent.length);

    // Generate 0-3 random tags for this thought
    const tagCount = Math.floor(Math.random() * 4);
    const thoughtTags: string[] = [];
    for (let j = 0; j < tagCount; j++) {
      const randomTag = sampleTags[Math.floor(Math.random() * sampleTags.length)];
      if (!thoughtTags.includes(randomTag)) {
        thoughtTags.push(randomTag);
      }
    }

    const thought: Thought = {
      id: generateUUID(),
      title: sampleTitles[titleIndex],
      content: sampleContent[contentIndex],
      createdAt: Math.floor(randomDate),
      tags: thoughtTags,
    };

    thoughts.push(thought);
  }

  // Sort by creation date (newest first)
  return thoughts.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Simple UUID v4 generator.
 * Used for generating IDs for sample thoughts.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
