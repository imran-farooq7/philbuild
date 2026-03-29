// components/admin/reports-export.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import {
  CalendarIcon,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReportsExport() {
  const [reportType, setReportType] = useState("projects");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [format, setFormat] = useState("csv");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          from: dateRange.from,
          to: dateRange.to,
          format,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportType}_report_${formatDate(dateRange.from, "yyyy-MM-dd")}_to_${formatDate(dateRange.to, "yyyy-MM-dd")}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Your report has been downloaded successfully");
      }
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports & Export</CardTitle>
        <CardDescription>Generate and export platform reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="projects">Projects Report</SelectItem>
                <SelectItem value="users">Users Report</SelectItem>
                <SelectItem value="contractors">Contractors Report</SelectItem>
                <SelectItem value="financial">Financial Report</SelectItem>
                <SelectItem value="reviews">Reviews Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="json">JSON (Raw Data)</SelectItem>
                <SelectItem value="pdf">PDF (Printable)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from
                    ? formatDate(dateRange.from, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) =>
                    date && setDateRange({ ...dateRange, from: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to
                    ? formatDate(dateRange.to, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) =>
                    date && setDateRange({ ...dateRange, to: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        {/* Quick Export Options */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Quick Export Templates</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              Monthly Summary
            </Button>
            <Button variant="outline" size="sm">
              Quarterly Report
            </Button>
            <Button variant="outline" size="sm">
              Contractor Performance
            </Button>
            <Button variant="outline" size="sm">
              Financial Overview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
