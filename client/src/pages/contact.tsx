import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  Mail,
  Send,
  Zap,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  X,
  Bot,
  User,
  ArrowRight,
  Globe,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import logoImage from "@assets/Untitled design (28)_1756451105933.png";

const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .min(3, "Subject must be at least 3 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hi! Welcome to Bright Electricals! I'm here to help you with electrical services. How can I assist you today?",
      isBot: true,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);

  const headerRef = useRef(null);
  const cardRef = useRef(null);
  const actionsRef = useRef(null);
  const formRef = useRef(null);
  const mapRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true });
  const cardInView = useInView(cardRef, { once: true });
  const actionsInView = useInView(actionsRef, { once: true });
  const formInView = useInView(formRef, { once: true });
  const mapInView = useInView(mapRef, { once: true });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const handleRippleEffect = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.classList.add("ripple");

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Message sent successfully!",
      description: "Thank you for your message. We'll get back to you soon.",
    });

    form.reset();
    setIsSubmitting(false);
  };

  const quickActions = [
    { id: 'quote', text: '💡 Get Quote', action: 'quote' },
    { id: 'emergency', text: '🚨 Emergency Service', action: 'emergency' },
    { id: 'hours', text: '🕒 Business Hours', action: 'hours' },
    { id: 'services', text: '⚡ Our Services', action: 'services' },
  ];

  const getSmartResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('emergency') || input.includes('urgent') || input.includes('help')) {
      return "🚨 For electrical emergencies, please call us immediately at +91 7506978153. Our emergency services are available 24/7 for urgent electrical issues.";
    }
    
    if (input.includes('quote') || input.includes('price') || input.includes('cost') || input.includes('estimate')) {
      return "💡 I'd be happy to help you get a quote! Please fill out the contact form with details about your electrical needs, or call us at +91 7506978153 for a quick estimate.";
    }
    
    if (input.includes('hours') || input.includes('open') || input.includes('time')) {
      return "🕒 Our business hours are Monday-Friday: 9:00 AM - 6:00 PM. For emergencies, we're available 24/7. Contact us anytime!";
    }
    
    if (input.includes('service') || input.includes('electrical') || input.includes('wiring') || input.includes('installation')) {
      return "⚡ We provide comprehensive electrical services including wiring, installations, repairs, maintenance, and emergency services. Visit our website or call +91 7506978153 for more details!";
    }
    
    if (input.includes('location') || input.includes('address') || input.includes('where')) {
      return "📍 We're located at 26 Mehta Building, 1st floor, Room no. 3, Calicut Street, Ballard Estate. You can find us on the map below!";
    }
    
    return "Thanks for your message! Our team specializes in all electrical services. For specific inquiries, please call +91 7506978153 or fill out our contact form. How else can I help you today?";
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActions(false);
    
    const actionMessages = {
      quote: "I'd like to get a quote for electrical services",
      emergency: "I need emergency electrical service", 
      hours: "What are your business hours?",
      services: "What electrical services do you provide?"
    };

    const userMessage = {
      id: chatMessages.length + 1,
      text: actionMessages[action as keyof typeof actionMessages],
      isBot: false
    };

    setChatMessages((prev) => [...prev, userMessage]);

    // Provide specific responses for each action
    setTimeout(() => {
      let botResponse = "";
      
      switch(action) {
        case 'quote':
          botResponse = "💡 Great! To provide you with an accurate quote, I'll need some details about your electrical needs. Please fill out our contact form or call us at +91 7506978153. We offer free estimates!";
          break;
        case 'emergency':
          botResponse = "🚨 For immediate electrical emergencies, please call us now at +91 7506978153. We provide 24/7 emergency services for urgent electrical issues. Stay safe!";
          break;
        case 'hours':
          botResponse = "🕒 Our business hours are:\nMonday-Friday: 9:00 AM - 6:00 PM\n\nFor emergencies, we're available 24/7. You can reach us anytime at +91 7506978153.";
          break;
        case 'services':
          botResponse = "⚡ Bright Electricals provides comprehensive electrical services:\n• Electrical installations\n• Wiring & rewiring\n• Electrical repairs\n• Maintenance services\n• Emergency electrical services\n• Safety inspections\n\nVisit our website or call +91 7506978153 for detailed information!";
          break;
        default:
          botResponse = "How can I help you further with your electrical needs?";
      }
      
      setChatMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: botResponse,
          isBot: true,
        },
      ]);
    }, 1000);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setShowQuickActions(false);

    const userMessage = {
      id: chatMessages.length + 1,
      text: chatInput,
      isBot: false,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");

    // Get smart response based on user input
    setTimeout(() => {
      const smartResponse = getSmartResponse(currentInput);
      
      setChatMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: smartResponse,
          isBot: true,
        },
      ]);
    }, 1000);
  };

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/hussain.pakawala", color: "hover:bg-blue-600" },
    { icon: Instagram, href: "https://www.instagram.com/hussain_pakawala/", color: "hover:bg-pink-600" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/hussain-pakawala-649894134/", color: "hover:bg-blue-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header Section */}
      <motion.header
        ref={headerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center py-12"
      >
        <div className="max-w-4xl mx-auto px-4">
          {/* Company Logo */}
          <motion.a
            href="https://www.brightelectricals.co.in/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              headerInView
                ? { scale: 1, opacity: 1 }
                : { scale: 0.8, opacity: 0 }
            }
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="block w-24 h-24 mx-auto mb-6 rounded-2xl shadow-xl animate-glow-pulse hover:animate-none overflow-hidden"
            data-testid="company-logo"
          >
            <img 
              src={logoImage} 
              alt="Bright Electricals Logo" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={
              headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent mt-[8px] mb-[8px] pt-[7px] pb-[7px]"
            data-testid="page-title"
          >
            Contact Bright Electricals
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={
              headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-muted-foreground font-medium"
            data-testid="page-subtitle"
          >
            Your trusted electrical solutions partner. We'd love to hear from you!
          </motion.p>
        </div>
      </motion.header>

      {/* Main Contact Card */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={
            cardInView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 40, scale: 0.95 }
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="contact-card rounded-3xl p-8 md:p-12 shadow-2xl hover-lift border border-border/50"
          data-testid="contact-card"
        >
          {/* Contact Actions and Form Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Actions */}
            <motion.div
              ref={actionsRef}
              initial={{ opacity: 0, x: -30 }}
              animate={
                actionsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
              }
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2
                className="text-2xl font-semibold mb-6 text-accent"
                data-testid="contact-actions-title"
              >
                Get In Touch
              </h2>

              {/* Enhanced Contact Grid */}
              <div className="grid gap-4">
                {/* Call Us Button */}
                <motion.a
                  href="tel:+917506978153"
                  onClick={handleRippleEffect}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 flex items-center gap-4 p-4 rounded-2xl text-white font-semibold shadow-lg transition-all duration-300"
                  data-testid="button-call"
                >
                  <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm opacity-90">Call us now</div>
                    <div className="text-lg">+91 7506978153</div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.a>

                {/* Email Us Button */}
                <motion.a
                  href="mailto:hussain@brightelectricals.co.in"
                  onClick={handleRippleEffect}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 flex items-center gap-4 p-4 rounded-2xl text-white font-semibold shadow-lg transition-all duration-300"
                  data-testid="button-email"
                >
                  <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm opacity-90">Send us an email</div>
                    <div className="text-lg">hussain@bright...</div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.a>

                {/* WhatsApp Button */}
                <motion.a
                  href="https://wa.link/ks8dxp"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleRippleEffect}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 flex items-center gap-4 p-4 rounded-2xl text-white font-semibold shadow-lg transition-all duration-300"
                  data-testid="button-whatsapp"
                >
                  <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <SiWhatsapp className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm opacity-90">Chat on WhatsApp</div>
                    <div className="text-lg">Quick Response</div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.a>

                {/* Website Button */}
                <motion.a 
                  href="https://www.brightelectricals.co.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleRippleEffect}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 flex items-center gap-4 p-4 rounded-2xl text-white font-semibold shadow-lg transition-all duration-300"
                  data-testid="button-website"
                >
                  <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm opacity-90">Visit our website</div>
                    <div className="text-lg">brightelectricals.co.in</div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.a>
              </div>

              {/* Social Media Icons */}
              <div className="pt-6">
                <h3
                  className="text-lg font-semibold mb-4 text-muted-foreground"
                  data-testid="social-media-title"
                >
                  Follow Us
                </h3>
                <div className="flex gap-4 justify-center md:justify-start">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={index}
                        href={social.href}
                        onClick={handleRippleEffect}
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                          actionsInView
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 20 }
                        }
                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                        whileHover={{
                          scale: 1.2,
                          rotate: 5,
                          transition: { duration: 0.3 },
                        }}
                        whileTap={{ scale: 0.9 }}
                        className={`social-icon w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-secondary-foreground hover:text-accent-foreground transition-colors duration-300 ${social.color}`}
                        data-testid={`social-link-${index}`}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, x: 30 }}
              animate={
                formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
              }
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2
                className="text-2xl font-semibold mb-6 text-accent"
                data-testid="form-title"
              >
                Send a Message
              </h2>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                  data-testid="contact-form"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="John Doe"
                              className="form-input-enhanced bg-input border-border text-foreground"
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">
                            Email Address *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="john@example.com"
                              className="form-input-enhanced bg-input border-border text-foreground"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          Subject *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="How can we help you?"
                            className="form-input-enhanced bg-input border-border text-foreground"
                            data-testid="input-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          Message *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            placeholder="Tell us about your project or inquiry..."
                            className="form-input-enhanced bg-input border-border text-foreground resize-none"
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      onClick={handleRippleEffect}
                      className="btn-primary-enhanced w-full py-4 px-6 text-accent-foreground font-semibold text-lg flex items-center justify-center gap-3 group relative overflow-hidden"
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full" />
                          </motion.div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Send className="w-5 h-5" />
                          </motion.div>
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </motion.div>
          </div>

          {/* Map Section */}
          <motion.div
            ref={mapRef}
            initial={{ opacity: 0, y: 30 }}
            animate={mapInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2
              className="text-2xl font-semibold mb-6 text-accent text-center"
              data-testid="map-title"
            >
              Our Location
            </h2>

            <div
              className="map-container rounded-2xl overflow-hidden shadow-xl border border-border/50"
              data-testid="map-container"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15095.645514246371!2d72.8383936!3d18.9353164!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xd9d0c3001034cc68!2sBright%20Electricals!5e0!3m2!1sen!2sin!4v1633675442059!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                title="Company Location Map"
                data-testid="google-map"
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={mapInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-6 text-muted-foreground space-y-2"
            >
              <div
                className="flex items-center justify-center gap-2 font-medium"
                data-testid="address"
              >
                <MapPin className="w-4 h-4" />
                <span>26 Mehta Building, 1st floor, Room no. 3, Calicut Street, Ballard Estate</span>
              </div>
              <div
                className="flex items-center justify-center gap-2 text-sm"
                data-testid="hours"
              >
                <Clock className="w-4 h-4" />
                <span>Monday - Friday: 9:00 AM - 6:00 PM PST</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Floating Chatbot */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        {/* Chat Toggle Button */}
        <motion.button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gradient-to-r from-accent to-accent/80 rounded-full shadow-2xl flex items-center justify-center text-accent-foreground animate-glow-pulse hover:animate-none"
          data-testid="chatbot-toggle"
        >
          <AnimatePresence mode="wait">
            {isChatbotOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Chat Interface */}
        <AnimatePresence>
          {isChatbotOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-20 right-0 w-80 h-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              data-testid="chatbot-interface"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-accent to-accent/80 p-4 text-accent-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Support Assistant</h3>
                    <p className="text-sm opacity-90">Online now</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-3 h-64 overflow-y-auto bg-background/50">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    {message.isBot && (
                      <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-accent" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        message.isBot
                          ? "bg-muted text-muted-foreground rounded-tl-sm"
                          : "bg-accent text-accent-foreground rounded-tr-sm"
                      }`}
                    >
                      {message.text}
                    </div>
                    {!message.isBot && (
                      <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-3 h-3 text-accent" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Quick Action Buttons */}
                {showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border-t border-border/50"
                  >
                    <div className="text-xs text-muted-foreground mb-2 text-center">
                      Quick actions:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => (
                        <motion.button
                          key={action.id}
                          onClick={() => handleQuickAction(action.action)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-xs bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-lg p-2 transition-colors duration-200"
                          data-testid={`quick-action-${action.id}`}
                        >
                          {action.text}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {/* Show Quick Actions Again Button */}
                {!showQuickActions && chatMessages.length > 1 && (
                  <div className="p-2 text-center">
                    <motion.button
                      onClick={() => setShowQuickActions(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs text-accent hover:text-accent/80 underline"
                      data-testid="show-quick-actions"
                    >
                      Show quick actions
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-card">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-input border-border"
                    data-testid="chat-input"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-accent hover:bg-accent/80 text-accent-foreground"
                    data-testid="chat-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
