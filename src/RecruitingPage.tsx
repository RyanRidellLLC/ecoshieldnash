import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, GraduationCap, Phone, Mail, User, ChevronDown, Video, Upload, X } from 'lucide-react';
import { uploadVideo, formatFileSize } from './utils/videoUpload';

export default function RecruitingPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setUploadError('');
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setUploadError('');
    const fileInput = document.getElementById('video') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadError('');

    try {
      let videoData = null;

      if (videoFile) {
        setUploadProgress('Uploading video...');
        try {
          videoData = await uploadVideo(videoFile);
          setUploadProgress('Video uploaded successfully!');
        } catch (error) {
          setUploadError(error instanceof Error ? error.message : 'Failed to upload video');
          setUploadProgress('');
          setIsSubmitting(false);
          return;
        }
      }

      setUploadProgress('Submitting application...');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-application`;

      const submissionData = {
        ...formData,
        ...(videoData && {
          video_url: videoData.url,
          video_filename: videoData.filename,
          video_size: videoData.size,
          video_uploaded_at: new Date().toISOString(),
        }),
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
        setVideoFile(null);
        setUploadProgress('');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setUploadError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scrollToForm = () => {
    document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openCalendly = () => {
    window.open('https://calendly.com/jshlug7/30min', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(/nash_background.png)`
        }}></div>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Now Hiring for Summer 2026
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto">
            AVERAGE SALES REP EARNS 30K+ WITHIN 4 MONTHS!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openCalendly}
              className="bg-white text-[#009975] px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            >
              Book Your Interview Call
            </button>
            <button
              onClick={scrollToForm}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-[#009975] transition-all transform hover:scale-105"
            >
              Submit Application
            </button>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative py-20 section-transition overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(/background_1.jpg)`
        }}></div>
        <div className="absolute inset-0 bg-white opacity-85"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 fade-in-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            See What It's Like to Be Part of Ecoshield
          </h2>
          <p className="text-center text-gray-700 mb-12 text-lg">Real reps. Real results. Real growth.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Video 1 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img
                  src="/shield_marketing.jpg"
                  alt="Day in the Life - Ecoshield Sales"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-900">Experience a Day in the Field</h3>
                <p className="text-gray-600">See what a typical day looks like for our sales reps</p>
              </div>
            </div>

            {/* Video 2 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img
                  src="/img_4030.jpg"
                  alt="Success Stories - Ecoshield Sales"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-900">Hear From Top Performers</h3>
                <p className="text-gray-600">Learn how our reps achieve incredible results</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Section */}
      <section className="relative py-20 section-transition overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(/img_4010.jpg)`
        }}></div>
        <div className="absolute inset-0 bg-white opacity-90"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 fade-in-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            What You Can Expect Your First Summer
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-[#009975] to-[#007d5e] rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all">
              <DollarSign className="w-16 h-16 mb-4 mx-auto" />
              <h3 className="text-2xl font-bold mb-2 text-center">Average First-Year Rep</h3>
              <p className="text-5xl font-bold text-center mb-2 text-yellow-300">$30,000+</p>
              <p className="text-center text-gray-100">In just one summer</p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-[#007d5e] to-[#006b52] rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all">
              <TrendingUp className="w-16 h-16 mb-4 mx-auto" />
              <h3 className="text-2xl font-bold mb-2 text-center">Top Performers</h3>
              <p className="text-5xl font-bold text-center mb-2 text-yellow-300">$100,000+</p>
              <p className="text-center text-gray-100">The sky's the limit</p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-[#006b52] to-[#005943] rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all">
              <GraduationCap className="w-16 h-16 mb-4 mx-auto" />
              <h3 className="text-2xl font-bold mb-2 text-center">No Experience Needed</h3>
              <p className="text-5xl font-bold text-center mb-2 text-yellow-300">We Train You</p>
              <p className="text-center text-gray-100">Full support provided</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              Our sales internship at Ecoshield Nashville Sales trains college-aged reps to master communication, leadership, and sales.
              You'll earn more in a few months than most part-time jobs pay all year — while building skills that set you up for life.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 section-transition">
        <div className="max-w-4xl mx-auto px-6 fade-in-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Everything you need to know before applying</p>

          <div className="space-y-4">
            {[ 
              {
                question: "Do I need sales experience?",
                answer: "Not at all! We provide comprehensive training for all new reps. Many of our top performers had zero sales experience before joining. We teach you everything you need to know.",
              },
              {
                question: "What's the time commitment?",
                answer: "This is a full-time summer sales internship, typically running from May through August. You'll work Monday through Friday. Most reps work 40-50 hours per week during peak season.",
              },
              {
                question: "How does the pay structure work?",
                answer: "You'll earn commission-based pay, which means your income is directly tied to your performance. The more you sell, the more you earn. We also offer bonuses for top performers.",
              },
              {
                question: "Where will I be working?",
                answer: "You'll be working in the Nashville area and surrounding regions. We provide territories and leads, so you'll always know where you're going. Transportation is your responsibility.",
              },
              {
                question: "What kind of training do you provide?",
                answer: "We have a 5 star rep program to complete before you come out. We offer a comprehensive onboarding program that covers product knowledge, sales techniques, customer relationship management, and on-the-job shadowing.",
              },
              {
                question: "Can I do this while taking summer classes?",
                answer: "This sales internship requires full-time availability during business hours, so taking summer classes is not advised."
              },
              {
                question: "What happens after the summer ends?",
                answer: "Many interns return for multiple summers, and some transition into year-round leadership roles. You'll also gain invaluable sales and communication skills that translate to any career.",
              },
              {
                question: "What's the interview process like?",
                answer: "After submitting your application, you'll be invited to a 10-15 minute phone interview where we'll discuss your goals, availability, and fit for the role. If it's a good match, you'll proceed with onboarding."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg pr-8">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#009975] flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply-section" className="py-20 bg-gradient-to-br from-[#009975] to-[#007d5e] section-transition">
        <div className="max-w-2xl mx-auto px-6 fade-in-on-scroll">
          <div className="text-center text-white mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Learn More?</h2>
            <p className="text-xl text-gray-100 mb-6">Book a short 10-minute interview to see if you're a fit</p>
            <button
              onClick={openCalendly}
              className="bg-white text-[#009975] px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl inline-block"
            >
              Schedule Interview Now
            </button>
            <p className="text-gray-100 mt-6 mb-4">Or submit your information below and we'll reach out to you</p>
          </div>

          {isSubmitted ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-2xl">
              <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Thanks for Your Interest!</h3>
              <p className="text-lg text-gray-600 mb-6">
                You will hear back from our team soon to book a call.
              </p>
              <p className="text-gray-600 mb-8">Want to schedule your interview right now?</p>
              <button
                onClick={openCalendly}
                className="bg-[#009975] text-white px-8 py-3 rounded-full font-bold hover:bg-[#007d5e] transition-all mb-4"
              >
                Book Interview on Calendly
              </button>
              <br />
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-[#009975] font-semibold hover:underline text-sm"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors"
                    placeholder="(615) 555-0123"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe what you'll bring to our team and why you think you should sell with us
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#009975] focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label htmlFor="video" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Video className="inline w-4 h-4 mr-2" />
                    Upload Video (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Stand out with a short video introduction. Max 100MB. Formats: MP4, MOV, AVI, WebM
                  </p>

                  {!videoFile ? (
                    <div className="relative">
                      <input
                        type="file"
                        id="video"
                        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="video"
                        className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#009975] cursor-pointer transition-colors bg-gray-50"
                      >
                        <div className="text-center">
                          <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-700">Click to upload video</p>
                          <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Video className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{videoFile.name}</p>
                          <p className="text-xs text-gray-600">{formatFileSize(videoFile.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}

                  {uploadProgress && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-600">{uploadProgress}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#009975] to-[#007d5e] text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (uploadProgress || 'Submitting...') : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#009975] text-white py-12 section-transition">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-lg mb-4">
            © 2025 Ecoshield Nashville Sales — Empowering the next generation of high-earning leaders
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-200">
            <a href="#" className="hover:text-yellow-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-yellow-300 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-yellow-300 transition-colors">Contact Us</a>
            <span>•</span>
            <a href="/admin" className="hover:text-yellow-300 transition-colors">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
