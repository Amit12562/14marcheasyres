import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  CreditCard,
  Users,
  Download,
  History,
  MessageCircle,
  Receipt,
  Terminal,
  LayoutDashboard,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import RechargeForm from "@/components/RechargeForm";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "Top Sell Services", href: "/top-sell" },
  { icon: ShoppingCart, label: "Buy Numbers", href: "/buy-numbers" },
  { icon: CreditCard, label: "Recharge", href: "#recharge" },
  { icon: Users, label: "Refer & Earn", href: "/refer" },
  { icon: Download, label: "Download Our APP", href: "/download" },
  { icon: History, label: "Numbers History", href: "/numbers-history" },
  { icon: MessageCircle, label: "SMS Check", href: "/sms-check" },
  { icon: Receipt, label: "Transaction History", href: "/transactions" },
  { icon: Terminal, label: "API Tools", href: "/api-tools" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [showRechargeForm, setShowRechargeForm] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-primary">₹</span>
                <span className="font-medium">{user?.walletBalance ?? "0.00"}</span>
              </div>
            </div>
          </div>
          <Input className="mb-4" placeholder="Search services..." />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="outline"
            className="h-auto p-4 flex items-center gap-3 justify-start text-left"
            onClick={() => {
              if (item.href === "#recharge") {
                setShowRechargeForm(true);
              }
            }}
          >
            <item.icon className="h-5 w-5 text-primary" />
            <span>{item.label}</span>
          </Button>
        ))}
      </div>

      {showRechargeForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Button
              variant="ghost"
              className="absolute top-4 right-4"
              onClick={() => setShowRechargeForm(false)}
            >
              ×
            </Button>
            <RechargeForm />
          </div>
        </div>
      )}
    </div>
  );
}