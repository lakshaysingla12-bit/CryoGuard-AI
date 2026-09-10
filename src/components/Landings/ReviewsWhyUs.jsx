import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../UI/Button";
import SectionHeading from "../UI/SectionHeading";
import IconBox from "../UI/IconBox";
import WhyUs from "./WhyUs";
import {
  ShieldCheck,
  Zap,
  LockKeyhole,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Snowflake,
  Database,
  BrainCircuit,
  BellRing,
  Eye,
  Clock3,
} from "lucide-react";

export default function ReviewsWhyUs() {
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      quote:
        "CryoGuard helped us identify temperature risks before they became expensive shipment failures.",
      name: "Operations Manager",
      company: "Regional Pharma Distributor",
      initials: "OM",
    },
    {
      quote:
        "The live fleet visibility completely changed how our team handles cold-chain operations.",
      name: "Fleet Operations Lead",
      company: "Healthcare Logistics",
      initials: "FL",
    },
    {
      quote:
        "Instead of reacting to temperature breaches, our team can now act before the shipment is compromised.",
      name: "Supply Chain Director",
      company: "Cold Storage Network",
      initials: "SC",
    },
  ];

  const reasons = [
    {
      icon: Zap,
      title: "Prevent problems, don't just report them",
      body:
        "Traditional monitoring tells you what already happened. CryoGuard focuses on what is likely to happen next.",
    },
    {
      icon: Eye,
      title: "Complete operational visibility",
      body:
        "Temperature, location, shipment status and alerts come together in one simple interface.",
    },
    {
      icon: ShieldCheck,
      title: "Protect high-value cargo",
      body:
        "Reduce the risk of spoiled pharmaceutical, food and temperature-sensitive shipments.",
    },
    {
      icon: Clock3,
      title: "Act while there is still time",
      body:
        "Early warnings give operations teams valuable time to intervene before cargo is compromised.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: Database,
      title: "Connect your sensors",
      body:
        "Connect existing cold-chain IoT sensors and start sending shipment data to CryoGuard.",
    },
    {
      number: "02",
      icon: BrainCircuit,
      title: "AI analyzes every reading",
      body:
        "Our intelligence layer continuously evaluates temperature, route and shipment conditions.",
    },
    {
      number: "03",
      icon: BellRing,
      title: "Receive an early warning",
      body:
        "When risk increases, your team receives an alert with the relevant shipment information.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Take action",
      body:
        "Intervene before the shipment crosses its safe operating limits.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <>
      <WhyUs />

{/* REVIEWS */}

<section id="reviews" className="cg-testimonials">
  <div className="cg-testimonials-header">
    <div>
      <span className="cg-testimonials-tag">CUSTOMER VOICES</span>
      <h2>Trusted by teams<br />that keep things moving.</h2>
    </div>


<p>
  Real feedback from operations teams using CryoGuard AI
  to monitor cold-chain performance with confidence.
</p>


  </div>

  <div className="cg-testimonial-card">


<div className="cg-testimonial-number">
  <span>0{currentReview + 1}</span>
  <div className="cg-testimonial-line"></div>
  <span>0{reviews.length}</span>
</div>

<div className="cg-testimonial-main">

  <div className="cg-testimonial-quote">
    
  </div>

  <blockquote>
    {reviews[currentReview].quote}
  </blockquote>

  <div className="cg-testimonial-footer">

    <div className="cg-testimonial-profile">
      <div className="cg-testimonial-avatar">
        {reviews[currentReview].initials}
      </div>

      <div className="cg-testimonial-info">
        <strong>{reviews[currentReview].name}</strong>
        <span>{reviews[currentReview].company}</span>
      </div>
    </div>

    <div className="cg-testimonial-rating">
      <span>★★★★★</span>
      <small>Verified experience</small>
    </div>

  </div>
</div>

<div className="cg-testimonial-controls">

  <button
    className="cg-testimonial-btn"
    onClick={() =>
      setCurrentReview(
        (prev) => (prev - 1 + reviews.length) % reviews.length
      )
    }
    aria-label="Previous review"
  >
    <ChevronLeft size={20} />
  </button>

  <button
    className="cg-testimonial-btn"
    onClick={() =>
      setCurrentReview(
        (prev) => (prev + 1) % reviews.length
      )
    }
    aria-label="Next review"
  >
    <ChevronRight size={20} />
  </button>

</div>


  </div>

  <div className="cg-testimonial-dots">
    {reviews.map((_, index) => (
      <button
        key={index}
        className={index === currentReview ? "active" : ""}
        onClick={() => setCurrentReview(index)}
        aria-label={`Review ${index + 1}`}
      />
    ))}
  </div>
</section>


      {/* FINAL CTA */}
<section className="lp-final-cta lp-cta-animated">
  <div className="lp-cta-glow"></div>

  <div className="lp-cta-content">


<div className="lp-cta-icon lp-cta-float">
  <Snowflake size={27} />
</div>

<span className="lp-section-label lp-cta-label">
  START MONITORING
</span>

<h2 className="lp-cta-title">
  Keep your cold chain
  <span> one step ahead.</span>
</h2>

<p className="lp-cta-description">
  See how CryoGuard AI can help your team detect risks before
  they become losses.
</p>

<Button
  to="/login"
  className="lp-cta-button lp-cta-button-animated"
>
  Explore the dashboard
</Button>


  </div>
</section>

      {/* FAQ */}
<section id="faq" className="lp-section lp-faq">
 <SectionHeading
  label="FAQ"
  title="Frequently asked questions."
  description="Find answers to common questions about CryoGuard AI and cold-chain monitoring."
/>

  <div className="lp-faq-list">
   
{[
  {
    question: "What is CryoGuard AI?",
    answer:
      "CryoGuard AI is an intelligent cold-chain monitoring platform that helps teams monitor temperature, shipment conditions, and operational risks in real time. It gives teams better visibility and helps them make faster, data-driven decisions.",
  },
  {
    question: "How does CryoGuard detect temperature risks?",
    answer:
      "CryoGuard continuously analyzes sensor readings and shipment conditions to identify potential risks before they become serious temperature breaches. This allows teams to detect abnormal conditions early and reduce the chances of product loss.",
  },
  {
    question: "Can CryoGuard monitor shipments in real time?",
    answer:
      "Yes. CryoGuard provides visibility into temperature, shipment status, location, and alerts so operations teams can respond quickly. Real-time monitoring helps teams stay informed throughout the entire transportation process.",
  },
  {
    question: "What happens when a shipment becomes risky?",
    answer:
      "CryoGuard can provide an early warning so the operations team has time to investigate the shipment and take appropriate action. Early alerts help reduce response time and support safer cold-chain operations.",
  },
  {
    question: "Can existing IoT sensors be connected?",
    answer:
      "CryoGuard is designed to work with cold-chain IoT sensor data, allowing existing monitoring infrastructure to be connected to the platform. This makes it easier for teams to use their existing sensor ecosystem with the monitoring system.",
  },



    ].map((faq, index) => (
      <details className="lp-faq-item" key={index}>
        <summary className="lp-faq-question">
          <span>{faq.question}</span>
          <span className="lp-faq-plus">+</span>
        </summary>

        <div className="lp-faq-answer">
          <p>{faq.answer}</p>
        </div>
      </details>
    ))}
  </div>
</section>
      {/* CONTACT US */}
<section className="lp-contact">
  <div className="lp-contact-content">
    <span className="lp-section-label">CONTACT US</span>

    <h2>Let's connect.</h2>

    <p>
      Have questions about CryoGuard AI? Reach out to our team through
      social media or WhatsApp.
    </p>

    <div className="lp-contact-links">
      <a
        href="https:/www.instagram.com/yashikaaaguptaa_/"
        target="_blank"
        rel="noopener noreferrer"
        className="lp-contact-link"
      >
        Instagram
      </a>

      <a
        href="https://linkedin.com/in/YOUR_LINKEDIN"
        target="_blank"
        rel="noopener noreferrer"
        className="lp-contact-link"
      >
        LinkedIn
      </a>

      <a
        href="https://wa.me/YOUR_WHATSAPP_NUMBER" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="lp-contact-link" 
      > 
        WhatsApp 
      </a> 
    </div> 
  </div> 
</section>
    </>
  );
}