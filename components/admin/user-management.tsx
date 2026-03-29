// components/admin/user-management.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Mail, MoreVertical, Search, Shield, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  phone: string;
  avatar_url: string | null;
  created_at: string;
  contractor_data?: {
    company_name: string;
    verification_status: string;
    verification_score: number;
    tier: string;
  };
  buyer_data?: {
    company_name: string;
    verified_phone: boolean;
  };
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        toast.success(`User role changed to ${newRole}`);
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/users/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success("User account has been suspended");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to suspend user");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500";
      case "contractor":
        return "bg-blue-500";
      case "buyer":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage platform users, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Send Newsletter
          </Button>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.full_name || "Unnamed"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.user_type)}>
                        {user.user_type?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setSelectedUser(user)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateUserRole(user.id, "admin")
                            }
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* User Details Dialog */}
        <Dialog
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogContent className="max-w-2xl">
            {selectedUser && (
              <>
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                  <DialogDescription>
                    Detailed information about {selectedUser.full_name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUser.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {selectedUser.full_name?.charAt(0) ||
                          selectedUser.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedUser.full_name}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedUser.email}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          className={getRoleBadgeColor(selectedUser.user_type)}
                        >
                          {selectedUser.user_type?.toUpperCase()}
                        </Badge>
                        {selectedUser.user_type === "contractor" &&
                          selectedUser.contractor_data && (
                            <Badge variant="outline">
                              Score:{" "}
                              {selectedUser.contractor_data.verification_score}
                            </Badge>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {selectedUser.phone || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Member Since
                      </p>
                      <p className="font-medium">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedUser.user_type === "contractor" &&
                    selectedUser.contractor_data && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">
                          Contractor Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Company
                            </p>
                            <p className="font-medium">
                              {selectedUser.contractor_data.company_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Verification Status
                            </p>
                            <Badge
                              className={
                                selectedUser.contractor_data
                                  .verification_status === "verified"
                                  ? "bg-green-500"
                                  : selectedUser.contractor_data
                                        .verification_status === "pending"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }
                            >
                              {selectedUser.contractor_data.verification_status.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Tier
                            </p>
                            <p className="font-medium">
                              {selectedUser.contractor_data.tier?.toUpperCase() ||
                                "Not assigned"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Score
                            </p>
                            <p className="font-medium">
                              {selectedUser.contractor_data.verification_score}
                              /100
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {selectedUser.user_type === "buyer" &&
                    selectedUser.buyer_data && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Buyer Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Company
                            </p>
                            <p className="font-medium">
                              {selectedUser.buyer_data.company_name ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Phone Verified
                            </p>
                            <Badge
                              className={
                                selectedUser.buyer_data.verified_phone
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }
                            >
                              {selectedUser.buyer_data.verified_phone
                                ? "Verified"
                                : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
