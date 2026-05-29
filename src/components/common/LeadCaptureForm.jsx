import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, User, Mail, Phone, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const serviceDetails = {
    'Homepage': {
        title: 'Request a Free Consultation',
        subtitle: 'Get a custom digital strategy and roadmap built by our creators.',
        benefits: [
            'Free comprehensive digital audit & proposal',
            'Direct consultation with expert developers & marketers',
            'High-performance design and scalable architecture',
            '24/7 client portal access and rapid response support'
        ],
        buttonText: 'Submit Request'
    },
    'Services Index': {
        title: 'Request a Free Project Proposal',
        subtitle: 'Let us know which services you need, and we will formulate a unified strategy.',
        benefits: [
            'Multi-service bundle discounts available',
            'Tailored project estimate with milestones',
            'Expert analysis of your existing systems',
            'SLA-backed delivery and ongoing support'
        ],
        buttonText: 'Submit Request'
    },
    'Web Development Services': {
        title: 'Get a Free Web Development Proposal',
        subtitle: 'Tell us about your product requirements to receive a customized technical roadmap.',
        benefits: [
            'Modern React/Next.js/Node.js tech stack matching',
            'SEO-friendly, blazing fast performance optimization',
            'Mobile-first responsive layouts and animations',
            'Secure database design and clean codebase structure'
        ],
        buttonText: 'Get Web Development Proposal'
    },
    'SEO Services': {
        title: 'Get a Free SEO Audit & Strategy',
        subtitle: 'Let us inspect your website and outline your custom search visibility roadmap.',
        benefits: [
            'Detailed keyword research & competitor gap analysis',
            'Technical SEO fix list (crawling, indexing, speed)',
            'Content strategy and organic link-building roadmap',
            'Transparent real-time ranking dashboard integration'
        ],
        buttonText: 'Start My Free SEO Audit'
    },
    'Design Services': {
        title: 'Request a Premium UI/UX Concept',
        subtitle: 'Share your brand vision to receive a custom design moodboard and interactive demo outline.',
        benefits: [
            'Stunning high-fidelity interactive Figma mockups',
            'User journey mapping & conversions-driven wireframes',
            'Custom premium typography and modern micro-animations',
            'Responsive design suited for mobile, tablet, and desktop'
        ],
        buttonText: 'Get My UI/UX Concept'
    },
    'Creative Services': {
        title: 'Request a Custom Creative Brief',
        subtitle: 'Get curated branding identity, graphic templates, and premium media concepts.',
        benefits: [
            'Bespoke brand logo & identity packages',
            'Custom Canva templates tailored for your social handles',
            'High-end visual asset design (banners, thumbnails, flyers)',
            'Pro-level video editing and content scripts'
        ],
        buttonText: 'Get My Creative Brief'
    },
    'Ads Management Services': {
        title: 'Get a Free Paid Campaigns Strategy',
        subtitle: 'Maximize your advertising budget with a custom funnel audit for Google and Meta Ads.',
        benefits: [
            'Strict ROAS-oriented keyword & audience targeting',
            'A/B testing plans for high-converting landing pages',
            'Detailed demographic & interest targeting setup',
            'Weekly transparent performance & spend reports'
        ],
        buttonText: 'Get Ads Campaign Strategy'
    }
};

const LeadCaptureForm = ({ pageName = 'Homepage' }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Retrieve context-specific copywriting
    const details = serviceDetails[pageName] || serviceDetails['Homepage'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const toastId = toast.loading('Sending your request...');

        try {
            const subject = `Lead Capture Form - Page: ${pageName}`;
            const messageBody = `Phone: ${formData.phone}\n\nMessage: ${formData.message}`;

            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: subject,
                    message: messageBody
                })
            });

            if (res.ok) {
                setSuccess(true);
                setFormData({ name: '', email: '', phone: '', message: '' });
                toast.success('Your request has been submitted successfully!', { id: toastId });
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to submit form.', { id: toastId });
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background decorative gradient glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
            
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    
                    {/* Left Info Column */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" /> Start Your Journey
                        </div>
                        <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight text-foreground">
                            Ready to accelerate your <span className="text-gradient-gold">growth?</span>
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Get a custom strategic plan built by our professional digital creators. Drop your details, and we will get back to you within 24 hours.
                        </p>
                        
                        <div className="space-y-4 pt-6 border-t border-border">
                            {details.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-5.5 h-5.5 rounded-full bg-accent/10 flex items-center justify-center text-accent mt-0.5 flex-shrink-0">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-base text-foreground/80 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Form Column */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {!success ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="glass-card p-8 md:p-10 border border-border bg-card/60 backdrop-blur-xl rounded-3xl shadow-xl relative overflow-hidden"
                                >
                                    <h3 className="text-2xl font-bold mb-2 text-foreground font-display">{details.title}</h3>
                                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{details.subtitle}</p>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Name */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                                                    <input 
                                                        type="text" 
                                                        name="name"
                                                        required
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="Musa Digital"
                                                        className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-300"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                                                    <input 
                                                        type="email" 
                                                        name="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="musaaxelman@gmail.com"
                                                        className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone Number (Optional)</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                                                <input 
                                                    type="tel" 
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Project Details</label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                                                <textarea 
                                                    name="message"
                                                    required
                                                    rows="4"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Tell us about your project goals, scope, and target timeline..."
                                                    className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-300 resize-none"
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full btn-primary py-4 flex items-center justify-center gap-2 group text-base font-bold tracking-wider disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Submitting Details...' : details.buttonText} 
                                            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-card p-10 border border-border bg-card/70 backdrop-blur-xl rounded-3xl text-center shadow-2xl flex flex-col items-center justify-center min-h-[400px]"
                                >
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6 border border-green-500/20 animate-bounce">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4 font-display text-foreground">Details Received!</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto mb-8 text-base">
                                        Thank you for reaching out. Our team is already analyzing your request and will contact you within the next 24 hours with a custom roadmap.
                                    </p>
                                    <button 
                                        onClick={() => setSuccess(false)}
                                        className="btn-outline px-8 py-3 text-sm font-bold tracking-wider hover:bg-accent/5"
                                    >
                                        Submit Another Request
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default LeadCaptureForm;
