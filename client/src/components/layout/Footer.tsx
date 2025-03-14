import { Link } from "wouter";

const navigation = {
  company: [
    { name: "About", href: "#about" },
    { name: "Careers", href: "#careers" },
    { name: "Contact", href: "#contact" },
  ],
  support: [
    { name: "Documentation", href: "#docs" },
    { name: "API Reference", href: "#api" },
    { name: "Status", href: "#status" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Cookie Policy", href: "#cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-muted/50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">IndianOTP.in</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Secure OTP verification services for Indian businesses. Protect your
              users with reliable authentication solutions.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-4 space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} IndianOTP.in. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
