"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, Users, Settings as SettingsIcon, Shield, Plus, Edit, Trash2 } from "lucide-react"

const organizationHierarchy = [
  { id: "GCC001", name: "ECWA General Church Council", type: "GCC", parent: null as string | null, level: 0 },
  { id: "DCC001", name: "ECWA Jos DCC", type: "DCC", parent: "GCC001", level: 1 },
  { id: "DCC002", name: "ECWA Kaduna DCC", type: "DCC", parent: "GCC001", level: 1 },
  { id: "LCC001", name: "ECWA Jos Central LCC", type: "LCC", parent: "DCC001", level: 2 },
  { id: "LCC002", name: "ECWA Bukuru LCC", type: "LCC", parent: "DCC001", level: 2 },
  { id: "LC001", name: "ECWA GoodNews HighCost - LC", type: "LC", parent: "LCC001", level: 3 },
  { id: "LC002", name: "ECWA Faith Chapel - LC", type: "LC", parent: "LCC001", level: 3 },
]

const userRoles = [
  {
    id: "ROLE001",
    name: "John Doe",
    email: "john.doe@church.org",
    role: "Senior Minister",
    status: "Active",
    lastLogin: "2024-01-15",
  },
  {
    id: "ROLE002",
    name: "Mary Johnson",
    email: "mary.johnson@church.org",
    role: "Financial Secretary",
    status: "Active",
    lastLogin: "2024-01-15",
  },
  {
    id: "ROLE003",
    name: "David Wilson",
    email: "david.wilson@church.org",
    role: "Youth Pastor",
    status: "Active",
    lastLogin: "2024-01-14",
  },
  {
    id: "ROLE004",
    name: "Sarah Brown",
    email: "sarah.brown@church.org",
    role: "Secretary",
    status: "On Leave",
    lastLogin: "2024-01-10",
  },
]

const getOrgTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    GCC: "bg-purple-100 text-purple-800",
    DCC: "bg-blue-100 text-blue-800",
    LCC: "bg-green-100 text-green-800",
    LC: "bg-orange-100 text-orange-800",
  }
  return <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>{type}</Badge>
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    case "On Leave":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          On Leave
        </Badge>
      )
    case "Inactive":
      return <Badge variant="destructive">Inactive</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function SettingsPage() {
  const [isAddOrgDialogOpen, setIsAddOrgDialogOpen] = useState(false)
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [orgData, setOrgData] = useState({
    name: "",
    type: "",
    address: "",
    phone: "",
    email: ""
  })
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    type: "",
    parentId: ""
  })
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: ""
  })

  useEffect(() => {
    setMounted(true)
    // Fetch user data
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user)
        if (data.user?.orgName) {
          setOrgData(prev => ({
            ...prev,
            name: data.user.orgName,
            type: data.user.orgId?.startsWith('DCC') ? 'DCC' : 
                  data.user.orgId?.startsWith('LCC') ? 'LCC' : 
                  data.user.orgId?.startsWith('LC') ? 'LC' : 'GCC'
          }))
        }
      })
  }, [])

  const handleSaveOrgInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: user?.orgId,
          orgName: orgData.name,
          role: user?.role
        })
      })
      if (res.ok) {
        alert('Organization information saved successfully!')
      }
    } catch (error) {
      console.error('Error saving org info:', error)
      alert('Failed to save organization information')
    }
  }

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrgData)
      })
      if (res.ok) {
        alert('Organization added successfully!')
        setIsAddOrgDialogOpen(false)
        setNewOrgData({ name: "", type: "", parentId: "" })
      }
    } catch (error) {
      console.error('Error adding organization:', error)
      alert('Failed to add organization')
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // This would need a proper user creation API
      alert('User creation functionality needs to be implemented')
      setIsAddRoleDialogOpen(false)
      setNewUserData({ firstName: "", lastName: "", email: "", role: "" })
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Failed to add user')
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight" >Settings</h1>
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight" >Settings</h1>
          <p className="text-gray-300">Manage organization settings, user roles, and system configuration.</p>
        </div>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Organization Information
              </CardTitle>
              <CardDescription>Basic information about your church organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSaveOrgInfo}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" >Organization Name</Label>
                    <Input 
                      id="orgName" 
                      value={orgData.name}
                      onChange={(e) => setOrgData(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgType" >Organization Type</Label>
                    <div>
                      <NativeSelect 
                        value={orgData.type} 
                        onChange={(e) => setOrgData(prev => ({...prev, type: e.target.value}))}
                      >
                        <option value="gcc">General Church Council (GCC)</option>
                        <option value="dcc">District Church Council (DCC)</option>
                        <option value="lcc">Local Church Council (LCC)</option>
                        <option value="lc">Local Church (LC)</option>
                      </NativeSelect>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" >Address</Label>
                  <Textarea 
                    id="address" 
                    value={orgData.address}
                    onChange={(e) => setOrgData(prev => ({...prev, address: e.target.value}))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" >Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={orgData.phone}
                      onChange={(e) => setOrgData(prev => ({...prev, phone: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" >Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={orgData.email}
                      onChange={(e) => setOrgData(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                </div>
                <Button type="submit" className="btn-primary">Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card style={{backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.2)"}}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading" >Organization Hierarchy</CardTitle>
                <CardDescription style={{color: "rgba(255, 255, 255, 0.7)"}}>Manage the church organizational structure</CardDescription>
              </div>
              <Dialog open={isAddOrgDialogOpen} onOpenChange={setIsAddOrgDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Organization
                  </Button>
                </DialogTrigger>
                <DialogContent style={{backgroundColor: "rgba(0, 0, 0, 0.9)", border: "1px solid rgba(255, 255, 255, 0.2)"}}>
                  <DialogHeader>
                    <DialogTitle >Add New Organization</DialogTitle>
                    <DialogDescription style={{color: "rgba(255, 255, 255, 0.7)"}}>Create a new organization in the hierarchy</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddOrganization}>
                    <div className="grid gap-4 p-6 pt-0">
                      <div className="space-y-2">
                        <Label htmlFor="newOrgName" >Organization Name</Label>
                        <Input 
                          id="newOrgName" 
                          placeholder="Enter organization name" 
                          value={newOrgData.name}
                          onChange={(e) => setNewOrgData(prev => ({...prev, name: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newOrgType" >Type</Label>
                        <NativeSelect 
                          value={newOrgData.type} 
                          onChange={(e) => setNewOrgData(prev => ({...prev, type: e.target.value}))}
                        >
                          <option value="">Select type</option>
                          <option value="dcc">District Church Council (DCC)</option>
                          <option value="lcc">Local Church Council (LCC)</option>
                          <option value="lc">Local Church (LC)</option>
                        </NativeSelect>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentOrg" >Parent Organization</Label>
                        <NativeSelect 
                          value={newOrgData.parentId} 
                          onChange={(e) => setNewOrgData(prev => ({...prev, parentId: e.target.value}))}
                        >
                          <option value="">Select parent</option>
                          <option value="GCC-001">ECWA General Church Council</option>
                          <option value="DCC-001">ECWA Jos DCC</option>
                          <option value="DCC-002">ECWA Kaduna DCC</option>
                          <option value="DCC-003">ECWA Abuja DCC</option>
                        </NativeSelect>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddOrgDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Organization</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizationHierarchy.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium" style={{ paddingLeft: `${org.level * 20 + 16}px` }}>
                        {org.name}
                      </TableCell>
                      <TableCell>{getOrgTypeBadge(org.type)}</TableCell>
                      <TableCell>
                        {org.parent ? organizationHierarchy.find((p) => p.id === org.parent)?.name : "-"}
                      </TableCell>
                      <TableCell>{org.level}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Role Management
                </CardTitle>
                <CardDescription>Manage user accounts and their roles within the organization</CardDescription>
              </div>
              <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account with role assignment</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email Address</Label>
                      <Input id="userEmail" type="email" placeholder="user@church.org" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role</Label>
                      <NativeSelect>
                        <option value="">Select role</option>
                        <option value="senior-minister">Senior Minister</option>
                        <option value="assistant-pastor">Assistant Pastor</option>
                        <option value="financial-secretary">Financial Secretary</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="secretary">Secretary</option>
                        <option value="cel">CEL</option>
                      </NativeSelect>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddRoleDialogOpen(false)}>Add User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Configure system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send email notifications for approvals and updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-backup</Label>
                    <p className="text-sm text-gray-500">Automatically backup data daily</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-gray-500">Log all user activities for audit purposes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <div>
                  <NativeSelect className="w-[200px]">
                    <option value="ngn">Nigerian Naira (₦)</option>
                    <option value="usd">US Dollar ($)</option>
                    <option value="eur">Euro (€)</option>
                  </NativeSelect>
                </div>
              </div>
              <Button className="btn-primary">Save System Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security policies and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Restrictions</Label>
                    <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <div>
                  <NativeSelect className="w-[200px]">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </NativeSelect>
                </div>
              </div>
              <Button className="btn-primary">Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


