'use client';
import { useState } from 'react';
import { PawPrint, ShieldCheck, Heart, Sparkles } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Top 5 Tips for First-Time Dog Owners',
    category: 'Dog Care',
    date: 'June 25, 2026',
    author: 'Sarah Jenkins',
    excerpt: 'Welcoming a new puppy into your home is exciting! Here are the essential tips to ensure a smooth transition and happy growth.',
    iconKey: 'dog',
    readTime: '5 min read',
    bgGradient: 'from-amber-50 to-amber-100'
  },
  {
    id: 2,
    title: 'Nutritional Guide: Choosing the Best Cat Food',
    category: 'Nutrition',
    date: 'June 20, 2026',
    author: 'Dr. David Miller (DVM)',
    excerpt: 'Not all cat food is created equal. Learn what ingredients to look for and how to plan a balanced diet for your feline friend.',
    iconKey: 'cat',
    readTime: '4 min read',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 3,
    title: 'Security & Safety: Protecting Your Pet Outdoors',
    category: 'Security',
    date: 'June 18, 2026',
    author: 'Alex Carter',
    excerpt: 'Keeping your pet secure in the garden or during walks is vital. Read our safety checklists and tips on pet trackers.',
    iconKey: 'shield',
    readTime: '6 min read',
    bgGradient: 'from-emerald-50 to-emerald-100'
  },
  {
    id: 4,
    title: 'Why Adopting is Better than Buying',
    category: 'Adoption',
    date: 'June 15, 2026',
    author: 'Emily Watson',
    excerpt: 'Adopt, dont shop! Discover the beautiful reality of rescue shelters and how adoption changes lives—both yours and the pets.',
    iconKey: 'heart',
    readTime: '3 min read',
    bgGradient: 'from-purple-50 to-purple-100'
  }
];

const iconMap = {
  dog: <PawPrint className="w-16 h-16 text-amber-500 opacity-80" />,
  cat: <PawPrint className="w-16 h-16 text-blue-500 opacity-80" />,
  shield: <ShieldCheck className="w-16 h-16 text-emerald-500 opacity-80" />,
  heart: <Heart className="w-16 h-16 text-purple-500 opacity-80" />
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Dog Care', 'Nutrition', 'Security', 'Adoption'];

  const filteredPosts = selectedCategory === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === selectedCategory);

  return (
    <div className="bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">Our Blog</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-4 mb-6">
            The PawHome Journal
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tips, guides, and heartwarming stories about our furry companions and their caregivers.
          </p>
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map(post => (
            <article key={post.id} className="card hover:translate-y-[-4px] flex flex-col h-full">
              <div className={`h-48 bg-gradient-to-br ${post.bgGradient} flex items-center justify-center relative`}>
                <div className="transform hover:scale-110 transition-transform duration-300">
                  {iconMap[post.iconKey] || <Sparkles className="w-16 h-16 text-slate-400" />}
                </div>
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {post.category}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 hover:text-primary transition-colors cursor-pointer leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-5 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">By {post.author}</span>
                  <span className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    Read Post →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
