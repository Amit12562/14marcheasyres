import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is IndianOTP.in?",
    answer:
      "IndianOTP.in is a secure OTP verification service designed specifically for Indian businesses. We provide virtual phone numbers and reliable OTP delivery services to help protect your users and prevent fraud.",
  },
  {
    question: "How does the OTP service work?",
    answer:
      "Our service provides virtual phone numbers that can receive OTP messages. When your application requests an OTP, we generate and deliver it securely to the user through our API, ensuring reliable and instant delivery.",
  },
  {
    question: "Is the service secure?",
    answer:
      "Yes, we implement enterprise-grade security measures including end-to-end encryption, secure API endpoints, and strict data privacy protocols to ensure your OTPs and user data remain protected.",
  },
  {
    question: "What are your delivery success rates?",
    answer:
      "We maintain a 99.9% OTP delivery success rate through our optimized delivery infrastructure and partnerships with leading telecom providers in India.",
  },
  {
    question: "How can I integrate the service?",
    answer:
      "Integration is simple through our REST API. We provide comprehensive documentation, SDKs for popular programming languages, and dedicated support to help you get started quickly.",
  },
  {
    question: "Do you offer custom solutions?",
    answer:
      "Yes, we offer custom enterprise solutions tailored to your specific needs, including dedicated virtual numbers, custom integration support, and SLA agreements.",
  },
];

export default function FAQ() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Everything you need to know about our service
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
