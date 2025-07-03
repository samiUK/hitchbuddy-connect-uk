import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Car, 
  MessageCircle, 
  Star,
  Shield,
  Search,
  Trash2,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'rider' | 'driver';
  phone?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalRiders: number;
  totalDrivers: number;
  totalRides: number;
  totalBookings: number;
  totalMessages: number;
}

export const AdminPortal = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRiders: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalBookings: 0,
    totalMessages: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminEmails, setAdminEmails] = useState<string[]>(['coolsami_uk@yahoo.com']);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all users from database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin statistics
  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminStats(data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  // Add new admin
  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    if (adminEmails.includes(newAdminEmail.trim().toLowerCase())) {
      toast({
        title: "Error",
        description: "This email is already an admin",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, this would be stored in database
    // For now, we'll store it locally
    const updatedAdmins = [...adminEmails, newAdminEmail.trim().toLowerCase()];
    setAdminEmails(updatedAdmins);
    setNewAdminEmail("");
    
    toast({
      title: "Success",
      description: `${newAdminEmail} has been added as an admin`,
    });
  };

  // Remove admin
  const handleRemoveAdmin = (email: string) => {
    if (email === 'coolsami_uk@yahoo.com') {
      toast({
        title: "Error",
        description: "Cannot remove the primary admin",
        variant: "destructive"
      });
      return;
    }

    const updatedAdmins = adminEmails.filter(admin => admin !== email);
    setAdminEmails(updatedAdmins);
    
    toast({
      title: "Success",
      description: `${email} has been removed as an admin`,
    });
  };

  // Delete user
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (adminEmails.includes(userEmail.toLowerCase())) {
      toast({
        title: "Error",
        description: "Cannot delete admin users",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        toast({
          title: "Success",
          description: `User ${userEmail} has been deleted`,
        });
        fetchAdminStats(); // Refresh stats
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAdminStats();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats.totalRiders} riders, {adminStats.totalDrivers} drivers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalRides}</div>
            <p className="text-xs text-muted-foreground">Posted rides</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Platform messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Admin Management</span>
          </CardTitle>
          <CardDescription>Add and manage admin users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Admin */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="admin-email">Add New Admin</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="Enter email address"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleAddAdmin} className="mt-6">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </div>

          {/* Current Admins */}
          <div>
            <Label>Current Admins</Label>
            <div className="space-y-2 mt-2">
              {adminEmails.map((email) => (
                <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                    <span>{email}</span>
                    {email === 'coolsami_uk@yahoo.com' && (
                      <Badge variant="default">Primary</Badge>
                    )}
                  </div>
                  {email !== 'coolsami_uk@yahoo.com' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAdmin(email)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Users */}
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.userType === 'driver' ? 'default' : 'secondary'}>
                          {user.userType}
                        </Badge>
                        {adminEmails.includes(user.email.toLowerCase()) && (
                          <Badge variant="destructive" className="ml-1">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.city || 'Not specified'}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-800"
                            disabled={adminEmails.includes(user.email.toLowerCase())}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};