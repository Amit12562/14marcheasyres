import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              Secure OTP Verification for{" "}
              <span className="text-primary">Indian Businesses</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Protect your users with our reliable OTP service. Prevent fraud and
              ensure secure authentication with virtual numbers at competitive rates.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, text: "Secure & Private" },
                { icon: Lock, text: "End-to-End Encryption" },
                { icon: CheckCircle, text: "99.9% Uptime" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1626624338641-b99e0d32c958"
              alt="Cyber Security Illustration"
              className="rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}