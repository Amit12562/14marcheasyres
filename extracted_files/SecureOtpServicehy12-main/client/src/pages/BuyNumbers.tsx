import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Service, serviceCategories } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingCart } from "lucide-react";

export default function BuyNumbers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory && service.isActive;
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buy Numbers</CardTitle>
          <CardDescription>
            Select a service to receive OTP verification numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services (e.g. WhatsApp, Amazon, Paytm)..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="space-y-4"
      >
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="all">All Services</TabsTrigger>
          {serviceCategories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>{service.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">₹{service.price}</span>
                    <Button className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredServices.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No services found. Try adjusting your search.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}