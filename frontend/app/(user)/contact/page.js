'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MapPin, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Your message has been sent successfully! We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-md">Get In Touch</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-4 mb-6">
            Contact PawHome
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about pet adoption, visits, or our products? Send us a message!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-primary/5 text-primary rounded-xl mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Rescue Center</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Chabahil, Kathmandu,<br />
                Bagmati Province, Nepal
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-primary/5 text-primary rounded-xl mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
              <p className="text-sm text-slate-500 hover:text-primary transition-colors">
                support@pawhome.org
              </p>
              <p className="text-xs text-slate-400 mt-1">Response time: &lt; 24 hours</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-primary/5 text-primary rounded-xl mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Visiting Hours</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Mon - Fri: 9:00 AM - 6:00 PM<br />
                Sat - Sun: 10:00 AM - 4:00 PM
              </p>
              <p className="text-xs text-orange-500 font-medium mt-1">Requires booking in advance</p>
            </div>

          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Sudip"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="sudip@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input"
                  placeholder="Inquiry about adoption process"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto self-end px-8"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
