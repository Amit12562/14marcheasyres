import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRechargeRequestSchema } from "@shared/schema";
import type { InsertRechargeRequest } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RechargeForm() {
  const { toast } = useToast();
  const form = useForm<InsertRechargeRequest>({
    resolver: zodResolver(insertRechargeRequestSchema),
  });

  const rechargeRequestMutation = useMutation({
    mutationFn: async (data: InsertRechargeRequest) => {
      const res = await apiRequest("POST", "/api/recharge/request", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Recharge Request Submitted",
        description: "Your recharge request has been sent to admin for approval.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recharge Wallet</CardTitle>
        <CardDescription>
          Enter the amount and UTR number to request a recharge
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => rechargeRequestMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              {...form.register("amount")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utrNumber">UTR Number</Label>
            <Input
              id="utrNumber"
              {...form.register("utrNumber")}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={rechargeRequestMutation.isPending}
          >
            {rechargeRequestMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
