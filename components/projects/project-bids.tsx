// components/projects/project-bids.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Award,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { submitBid, awardProject } from "@/actions/project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Bid = {
  id: string;
  amount: number;
  proposal: string;
  timeline_days: number;
  status: string;
  created_at: string;
  contractor: {
    id: string;
    company_name: string;
    verification_score: number;
    tier: string;
    profiles: {
      full_name: string;
      avatar_url: string | null;
    };
  };
};

type ProjectBidsProps = {
  projectId: string;
};

export function ProjectBids({ projectId }: ProjectBidsProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [proposal, setProposal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Fetch bids (this would normally come from server)
  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    const response = await fetch(`/api/projects/${projectId}/bids`);
    const data = await response.json();
    setBids(data.bids || []);
  };

  const handleSubmitBid = async () => {
    setIsSubmitting(true);
    try {
      await submitBid(
        projectId,
        parseFloat(bidAmount),
        proposal,
        parseInt(timeline),
      );
      toast.success("Your bid has been submitted successfully");
      setShowBidForm(false);
      fetchBids();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit bid",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAwardProject = async (bidId: string, contractorId: string) => {
    try {
      await awardProject(projectId, contractorId, bidId);
      toast.success("The project has been awarded to the selected contractor");
      fetchBids();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to award project",
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case "silver":
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case "bronze":
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Contractor Bids</h3>
          <p className="text-sm text-muted-foreground">
            Review and compare bids from qualified contractors
          </p>
        </div>
        <Dialog open={showBidForm} onOpenChange={setShowBidForm}>
          <DialogTrigger asChild>
            <Button>Submit Bid</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Your Bid</DialogTitle>
              <DialogDescription>
                Provide your proposal and pricing for this project
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Bid Amount (₱)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Estimated Timeline (days)</Label>
                <Input
                  type="number"
                  placeholder="Number of days to complete"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Proposal</Label>
                <Textarea
                  placeholder="Describe your approach, methodology, and why you're the best fit for this project..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBidForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitBid} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Bid"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bids List */}
      {bids.length > 0 ? (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={bid.contractor.profiles.avatar_url || undefined}
                      />
                      <AvatarFallback>
                        {bid.contractor.company_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {bid.contractor.company_name}
                        </CardTitle>
                        <Badge className={getTierColor(bid.contractor.tier)}>
                          {bid.contractor.tier?.toUpperCase() || "STANDARD"}{" "}
                          TIER
                        </Badge>
                      </div>
                      <CardDescription>
                        Submitted on {formatDate(bid.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(bid.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {bid.timeline_days} days
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Proposal Preview */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Proposal:
                    </p>
                    <p className="text-sm line-clamp-2">{bid.proposal}</p>
                  </div>

                  {/* Contractor Stats */}
                  <div className="flex gap-4 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Score: {bid.contractor.verification_score}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {bid.contractor.tier?.toUpperCase() || "Standard"} Tier
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Full Proposal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Proposal from {bid.contractor.company_name}
                          </DialogTitle>
                          <DialogDescription>
                            Submitted on {formatDate(bid.created_at)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="mb-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">
                              Bid Amount:
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(bid.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Estimated completion: {bid.timeline_days} days
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Proposal Details:
                            </p>
                            <p className="whitespace-pre-wrap">
                              {bid.proposal}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        handleAwardProject(bid.id, bid.contractor.id)
                      }
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Award Project
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No Bids Yet</h3>
            <p className="text-muted-foreground">
              Contractors haven't submitted bids for this project yet. Check
              back later or promote your project to attract more contractors.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips for Buyers */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">
                Tips for Selecting a Contractor
              </h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>
                  • Compare bids beyond just price - consider experience and
                  proposed timeline
                </li>
                <li>
                  • Review contractor verification scores and past project
                  history
                </li>
                <li>
                  • Check contractor certifications and specialties match your
                  project needs
                </li>
                <li>
                  • Reach out to contractors for clarification on their
                  proposals
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
