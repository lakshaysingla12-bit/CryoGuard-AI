import "./Landing.css";
import HeroFeatures from "./HeroFeatures";
import ReviewsWhyUs from "./ReviewsWhyUs";

export default function Landing() {
  return (
    <div className="landing-page">
      <header>
        <h1>CryoGuard AI</h1>
      </header>

      <HeroFeatures />

      <ReviewsWhyUs />
    </div>
  );
}