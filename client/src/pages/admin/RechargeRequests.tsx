import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import type { RechargeRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function RechargeRequests() {
  const { toast } = useToast();

  const { data: requests } = useQuery<RechargeRequest[]>({
    queryKey: ["/api/recharge/requests"],
    queryFn: getQueryFn({})
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/recharge/${id}/approve`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recharge/requests"] });
      toast({
        title: "Request Approved",
        description: "The recharge request has been approved.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/recharge/${id}/reject`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recharge/requests"] });
      toast({
        title: "Request Rejected",
        description: "The recharge request has been rejected.",
      });
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recharge Requests</h1>
      <div className="grid gap-4">
        {requests?.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>Recharge Request #{request.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Amount: ₹{request.amount}</p>
                <p>UTR Number: {request.utrNumber}</p>
                <p>Status: {request.status}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => approveMutation.mutate(request.id)}
                    disabled={request.status !== "pending"}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(request.id)}
                    disabled={request.status !== "pending"}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}