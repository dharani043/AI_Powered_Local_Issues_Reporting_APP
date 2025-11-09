import React, { useState } from 'react';
import { 
  Shield, Users, Target, Award, Heart, Star, Send, CheckCircle,
  MapPin, Clock, TrendingUp, MessageSquare, Mail, Phone, Globe
} from 'lucide-react';
import axios from 'axios';
export function AboutPage() {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
    category: 'general'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:5000/api/feedback', feedback, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback({
        name: '',
        email: '',
        rating: 5,
        message: '',
        category: 'general'
      });
    }, 3000);
  } catch (error) {
    console.error('Feedback submission failed:', error);
    alert('Failed to submit feedback. Please try again.');
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const stats = [
    { icon: Users, label: 'Active Citizens', value: '15+', color: 'text-blue-600' },
    { icon: CheckCircle, label: 'Issues Resolved', value: '6+', color: 'text-green-600' },
    { icon: Clock, label: 'Avg Response Time', value: '2.3 days', color: 'text-orange-600' },
    { icon: TrendingUp, label: 'Success Rate', value: '80%', color: 'text-purple-600' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and privacy measures.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by citizens, for citizens. Every voice matters in building better communities.'
    },
    {
      icon: Target,
      title: 'Efficient Resolution',
      description: 'Streamlined processes ensure quick identification and resolution of civic issues.'
    },
    {
      icon: Award,
      title: 'Transparent Process',
      description: 'Track every step from report to resolution with complete transparency.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Community Volunteer',
      message: 'This platform has revolutionized how we handle civic issues in our neighborhood. The response time is incredible!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      name: 'Michael Chen',
      role: 'Local Business Owner',
      message: 'Finally, a way to report and track infrastructure problems efficiently. The admin team is very responsive.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Resident',
      message: 'Love seeing the before and after photos of resolved issues. It really shows the impact of community involvement.',
      rating: 4,
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 rounded-2xl text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full">
              <Shield className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            CivicFix Platform
          </h1>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Empowering citizens to report, track, and resolve infrastructure issues in their communities. 
            Building smarter, more responsive cities together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
              <MapPin className="w-5 h-5 mr-2" />
              <span>Location-Based Reporting</span>
            </div>
            <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
              <Clock className="w-5 h-5 mr-2" />
              <span>Real-Time Tracking</span>
            </div>
            <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
              <Users className="w-5 h-5 mr-2" />
              <span>Community Collaboration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className={`inline-flex p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-4`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose CivicFix?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with community engagement to create 
            a seamless experience for reporting and resolving civic issues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Community Says
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real feedback from citizens who are making a difference in their communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                "{testimonial.message}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Share Your Feedback
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Help us improve CivicFix by sharing your thoughts and suggestions. 
              Your feedback drives our continuous improvement.
            </p>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Thank you for your feedback! We appreciate your input.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={feedback.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={feedback.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feedback Category
                </label>
                <select
                  name="category"
                  value={feedback.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="improvement">Improvement Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center space-x-2 pt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFeedback(prev => ({ ...prev, rating }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          rating <= feedback.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({feedback.rating}/5)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Message *
              </label>
              <textarea
                name="message"
                value={feedback.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Share your thoughts, suggestions, or report any issues you've encountered..."
              />
            </div>

            <button
              type="submit"
              disabled={submitted}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              {submitted ? 'Feedback Submitted!' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Have questions or need support? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-3">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email Support</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">support@civicfix.com</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full mb-3">
              <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone Support</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">+1 (555) 123-4567</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-3">
              <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Website</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">www.civicfix.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}