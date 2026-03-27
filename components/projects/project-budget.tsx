// components/projects/project-budget.tsx
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { addBudgetItem, updateBudgetItemActual } from "@/actions/project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

const BUDGET_CATEGORIES = [
  "Materials",
  "Labor",
  "Equipment",
  "Permits & Licenses",
  "Professional Fees",
  "Contingency",
  "Miscellaneous",
];

export function ProjectBudget({
  projectId,
  userRole,
}: {
  projectId: string;
  userRole: string;
}) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [allocatedAmount, setAllocatedAmount] = useState("");
  const [actualAmount, setActualAmount] = useState("");
  const router = useRouter();

  // This would normally come from a server component, but for demo we'll fetch it
  const [budgetData, setBudgetData] = useState({
    totalAllocated: 0,
    totalActual: 0,
    variance: 0,
    percentageUsed: 0,
    items: [],
  });

  // Fetch budget data on mount
  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    const response = await fetch(`/api/projects/${projectId}/budget`);
    const data = await response.json();
    setBudgetData(data);
  };

  const handleAddItem = async (formData: FormData) => {
    try {
      await addBudgetItem(formData);
      toast.success("The budget item has been added successfully");
      setIsAddingItem(false);
      fetchBudgetData();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add budget item",
      );
    }
  };

  const handleUpdateActual = async (itemId: string, actualAmount: number) => {
    try {
      await updateBudgetItemActual(itemId, actualAmount);
      toast.success("The actual cost has been updated successfully");
      fetchBudgetData();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update actual cost",
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Allocated Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(budgetData.totalAllocated)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Actual Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(budgetData.totalActual)}
            </p>
            <Progress value={budgetData.percentageUsed} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {budgetData.percentageUsed.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {budgetData.variance >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <p
                className={`text-2xl font-bold ${budgetData.variance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(Math.abs(budgetData.variance))}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {budgetData.variance >= 0 ? "Under budget" : "Over budget"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Items Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of project costs and expenses
              </CardDescription>
            </div>
            {userRole === "buyer" && (
              <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Budget Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form action={handleAddItem}>
                    <DialogHeader>
                      <DialogTitle>Add Budget Item</DialogTitle>
                      <DialogDescription>
                        Add a new line item to the project budget
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <input type="hidden" name="projectId" value={projectId} />

                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUDGET_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <Textarea
                          name="description"
                          placeholder="Describe the budget item"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Allocated Amount (₱)
                        </label>
                        <Input
                          type="number"
                          name="allocatedAmount"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingItem(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Add Item</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetData.items.map((item: any) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="outline" className="mb-2">
                      {item.category}
                    </Badge>
                    <p className="font-medium">{item.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Allocated: {formatCurrency(item.allocated_amount)}
                      </span>
                      {item.actual_amount > 0 && (
                        <span className="text-muted-foreground">
                          Actual: {formatCurrency(item.actual_amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {userRole === "buyer" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Actual Cost</DialogTitle>
                          <DialogDescription>
                            Enter the actual amount spent on this item
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                          <label className="text-sm font-medium">
                            Actual Amount (₱)
                          </label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={actualAmount}
                            onChange={(e) => setActualAmount(e.target.value)}
                          />
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={() =>
                              handleUpdateActual(
                                item.id,
                                parseFloat(actualAmount),
                              )
                            }
                          >
                            Update
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {item.allocated_amount > 0 && (
                  <Progress
                    value={(item.actual_amount / item.allocated_amount) * 100}
                    className="mt-3"
                  />
                )}
              </div>
            ))}

            {budgetData.items.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No budget items added yet</p>
                {userRole === "buyer" && (
                  <p className="text-sm mt-2">
                    Add budget items to track project costs
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
