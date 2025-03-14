import { motion } from "framer-motion";
import { Shield, Zap, Phone, Headphones, Lock, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "End-to-end encrypted OTP delivery for maximum security",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Lightning-fast OTP delivery with high success rates",
  },
  {
    icon: Phone,
    title: "Virtual Numbers",
    description: "Dedicated virtual numbers for reliable verification",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support for your business",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your data is protected with enterprise-grade security",
  },
  {
    icon: Clock,
    title: "Quick Setup",
    description: "Get started in minutes with our simple integration",
  },
];

export default function Features() {
  return (
    <section id="services" className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            Why Choose IndianOTP.in?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Comprehensive OTP solutions designed for Indian businesses
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
