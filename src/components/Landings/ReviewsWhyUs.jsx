import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../UI/Button";
import SectionHeading from "../UI/SectionHeading";
import WhyUs from "./WhyUs";
import HowItWorks from "./HowItWorks";
import FinalCTA from "./FinalCTA";
import FAQ from "./FAQ";
import Contact from "./Contact";
import { ChevronLeft, ChevronRight } from "lucide-react";
export default function ReviewsWhyUs({ onOpenLogin }) {
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

  return (
    <>
      <WhyUs />
      <HowItWorks />
      {/* REVIEWS */}

      <section id="reviews" className="cg-testimonials">
        <div className="cg-testimonials-header">
          <div>
            <span className="cg-testimonials-tag">CUSTOMER VOICES</span>
            <h2>
              Trusted by teams
              <br />
              that keep things moving.
            </h2>
          </div>

          <p>
            Real feedback from operations teams using CryoGuard AI to monitor
            cold-chain performance with confidence.
          </p>
        </div>

        <div className="cg-testimonial-card">
          <div className="cg-testimonial-number">
            <span>0{currentReview + 1}</span>
            <div className="cg-testimonial-line"></div>
            <span>0{reviews.length}</span>
          </div>

          <div className="cg-testimonial-main">
            <div className="cg-testimonial-quote"></div>

            <blockquote>{reviews[currentReview].quote}</blockquote>

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
                  (prev) => (prev - 1 + reviews.length) % reviews.length,
                )
              }
              aria-label="Previous review"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              className="cg-testimonial-btn"
              onClick={() =>
                setCurrentReview((prev) => (prev + 1) % reviews.length)
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

    <FinalCTA onOpenLogin={onOpenLogin} />

      <FAQ />
     <Contact />
     
    </>
  );
}
