// components/admin/system-settings.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SystemSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: "PHILbuild",
    platformEmail: "support@philbuild.com",
    contactPhone: "+63 2 8123 4567",
    maintenanceMode: false,

    // Verification Settings
    autoVerifyThreshold: 70,
    requireDocuments: true,
    verificationTimeout: 7,

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    adminAlertEmail: "admin@philbuild.com",

    // Project Settings
    defaultProjectDuration: 90,
    maxBudgetLimit: 1000000000,
    requireInsurance: true,

    // Commission Settings
    platformFee: 5,
    minPlatformFee: 1000,
    maxPlatformFee: 50000,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("System settings have been updated successfully");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure platform settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="commission">Commission</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) =>
                      setSettings({ ...settings, platformName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={settings.platformEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platformEmail: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, only admins can access the platform
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Verification Settings */}
          <TabsContent value="verification" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Auto-Verify Threshold (Score)</Label>
                <Input
                  type="number"
                  value={settings.autoVerifyThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoVerifyThreshold: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Contractors with score above this threshold are automatically
                  verified
                </p>
              </div>

              <div className="space-y-2">
                <Label>Verification Timeout (Days)</Label>
                <Input
                  type="number"
                  value={settings.verificationTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      verificationTimeout: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Days after which pending applications require admin review
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Documents</Label>
                  <p className="text-sm text-muted-foreground">
                    Require contractors to upload all required documents
                  </p>
                </div>
                <Switch
                  checked={settings.requireDocuments}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, requireDocuments: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable real-time push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, pushNotifications: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Admin Alert Email</Label>
                <Input
                  type="email"
                  value={settings.adminAlertEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      adminAlertEmail: e.target.value,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Receive alerts for critical platform events
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Project Settings */}
          <TabsContent value="projects" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Project Duration (Days)</Label>
                <Input
                  type="number"
                  value={settings.defaultProjectDuration}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultProjectDuration: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Budget Limit (₱)</Label>
                <Input
                  type="number"
                  value={settings.maxBudgetLimit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxBudgetLimit: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Insurance</Label>
                  <p className="text-sm text-muted-foreground">
                    Require contractors to have valid insurance
                  </p>
                </div>
                <Switch
                  checked={settings.requireInsurance}
                  onCheckedChange={(checked: boolean) =>
                    setSettings({ ...settings, requireInsurance: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Commission Settings */}
          <TabsContent value="commission" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Platform Fee (%)</Label>
                <Input
                  type="number"
                  value={settings.platformFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platformFee: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Platform Fee (₱)</Label>
                  <Input
                    type="number"
                    value={settings.minPlatformFee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        minPlatformFee: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Platform Fee (₱)</Label>
                  <Input
                    type="number"
                    value={settings.maxPlatformFee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxPlatformFee: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex gap-2">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
