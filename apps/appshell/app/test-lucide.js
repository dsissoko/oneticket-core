try {
  const lucide = require('lucide-react');
  const icons = Object.keys(lucide).filter(k => {
    const lower = k.toLowerCase();
    return lower.includes('git') || lower.includes('twitter') || lower.includes('link');
  });
  console.log('Found icons:', icons.slice(0, 20));
} catch (e) {
  console.error('Error:', e.message);
}
