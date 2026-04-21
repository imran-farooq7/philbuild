// components/contractor/my-bids.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Bid = {
  id: string;
  amount: number;
  proposal: string;
  timeline_days: number;
  status: string;
  created_at: string;
  project: {
    id: string;
    title: string;
    description: string;
    budget: number;
    start_date: string;
    end_date: string;
    buyer: {
      company_name: string;
      profile: {
        full_name: string;
      };
    };
  };
};

export function MyBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await fetch("/api/contractor/bids");
      const data = await response.json();
      setBids(data);
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "rejected":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const filteredBids = bids.filter((bid) => {
    if (filter === "all") return true;
    return bid.status === filter;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No bids yet</h3>
          <p className="text-muted-foreground">
            Start bidding on available projects to grow your business
          </p>
          <Link href="/dashboard/contractor/browse">
            <Button className="mt-4">Browse Projects</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({bids.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({bids.filter((b) => b.status === "pending").length})
        </Button>
        <Button
          variant={filter === "accepted" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("accepted")}
        >
          Accepted ({bids.filter((b) => b.status === "accepted").length})
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("rejected")}
        >
          Rejected ({bids.filter((b) => b.status === "rejected").length})
        </Button>
      </div>

      {filteredBids.map((bid) => (
        <Card key={bid.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{bid.project.title}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {bid.project.description}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(bid.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(bid.status)}
                  {bid.status.toUpperCase()}
                </span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Bid Amount */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Your Bid</p>
                  <p className="font-semibold text-lg">
                    {formatCurrency(bid.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="font-semibold">{bid.timeline_days} days</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Project Budget
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(bid.project.budget)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(bid.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Proposal Preview */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Your Proposal:</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {bid.proposal}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Link
              href={`/dashboard/projects/${bid.project.id}`}
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Project
              </Button>
            </Link>
            {bid.status === "accepted" && (
              <Link
                href={`/dashboard/projects/${bid.project.id}`}
                className="flex-1"
              >
                <Button className="w-full">Go to Project</Button>
              </Link>
            )}
            {bid.status === "pending" && (
              <Button variant="default" className="flex-1" disabled>
                <Clock className="h-4 w-4 mr-2" />
                Awaiting Response
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
