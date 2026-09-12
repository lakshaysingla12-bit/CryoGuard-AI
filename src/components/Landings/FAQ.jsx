
import SectionHeading from "../UI/SectionHeading";

export default function FAQ() {
  const faqs = [
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
  ];

  return (
    <section id="faq" className="lp-section lp-faq">
      <SectionHeading
        label="FAQ"
        title="Frequently asked questions."
        description="Find answers to common questions about CryoGuard AI and cold-chain monitoring."
      />

      <div className="lp-faq-list">
        {faqs.map((faq, index) => (
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
  );
}

