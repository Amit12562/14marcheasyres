import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">Get in Touch</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Have questions? We're here to help. Send us a message and we'll
              respond as soon as possible.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <span>support@indianotp.in</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <span>+91 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1501770118606-b1d640526693"
              alt="Customer Support"
              className="mt-12 rounded-lg"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div>
                    <Input placeholder="Your Name" />
                  </div>
                  <div>
                    <Input type="email" placeholder="Email Address" />
                  </div>
                  <div>
                    <Input placeholder="Subject" />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Your Message"
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
