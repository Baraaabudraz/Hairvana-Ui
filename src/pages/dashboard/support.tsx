import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Filter,
  Search,
  Eye,
  MessageCircle,
  DollarSign,
  CreditCard,
  Ban,
  RefreshCw,
  Settings,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2,
  Headphones,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { apiFetch } from "@/lib/api";

// Safe date formatting function
const formatDate = (dateString: string | null | undefined, formatString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    // Try different date parsing methods
    let date: Date;
    
    if (typeof dateString === 'string') {
      // Try parseISO first (for ISO strings)
      date = parseISO(dateString);
      
      // If parseISO fails, try new Date
      if (!isValid(date)) {
        date = new Date(dateString);
      }
      
      // If still invalid, try parsing as timestamp
      if (!isValid(date) && !isNaN(Number(dateString))) {
        date = new Date(Number(dateString));
      }
    } else {
      date = new Date(dateString);
    }
    
    if (!isValid(date)) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', dateString);
    return 'Invalid Date';
  }
};

interface SupportTicket {
  id: string;
  ticket_number: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  assignedAdmin?: {
    id: string;
    name: string;
    email: string;
  };
  subscription?: {
    id: string;
    plan_id: string;
    status: string;
  };
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  resolution_notes?: string;
  createdAt: string;
  updatedAt: string;
  resolved_at?: string;
  closed_at?: string;
  messages?: SupportMessage[];
}

interface SupportMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  message: string;
  is_internal: boolean;
  createdAt: string;
}

interface SupportStats {
  total: number;
  by_status: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  by_category: Array<{ category: string; count: number }>;
  by_priority: Array<{ priority: string; count: number }>;
}

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  pending_user: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const statusIcons = {
  open: AlertCircle,
  in_progress: Clock,
  pending_user: User,
  resolved: CheckCircle,
  closed: Ban,
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const categoryLabels = {
  subscription_cancellation: "Subscription Cancellation",
  refund_request: "Refund Request",
  billing_issue: "Billing Issue",
  technical_support: "Technical Support",
  account_issue: "Account Issue",
  feature_request: "Feature Request",
  general_inquiry: "General Inquiry",
  bug_report: "Bug Report",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [page, statusFilter, categoryFilter, priorityFilter, searchTerm]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await apiFetch(`/support?${params}`);
      
      // Ensure we have valid data structure
      if (response && response.data && Array.isArray(response.data)) {
        setTickets(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setTickets([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
      setTickets([]);
      setTotalPages(1);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiFetch("/support/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    try {
      const response = await apiFetch(`/support/${ticketId}`);
      setSelectedTicket(response.data);
      setTicketDialogOpen(true);
    } catch (error) {
      console.error("Error loading ticket details:", error);
      toast({
        title: "Error",
        description: "Failed to load ticket details",
        variant: "destructive",
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await apiFetch(`/support/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });

      loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        loadTicketDetails(ticketId);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const addMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      await apiFetch(`/support/${selectedTicket.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: newMessage,
          is_internal: isInternal,
        }),
      });

      toast({
        title: "Success",
        description: "Message added successfully",
      });

      setNewMessage("");
      setIsInternal(false);
      loadTicketDetails(selectedTicket.id);
    } catch (error) {
      console.error("Error adding message:", error);
      toast({
        title: "Error",
        description: "Failed to add message",
        variant: "destructive",
      });
    }
  };

  const processCancellation = async (ticketId: string, immediate: boolean = false) => {
    try {
      await apiFetch(`/support/${ticketId}/cancel-subscription`, {
        method: "POST",
        body: JSON.stringify({
          reason: "Customer request via support ticket",
          immediate,
        }),
      });

      toast({
        title: "Success",
        description: "Subscription cancellation processed",
      });

      loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        loadTicketDetails(ticketId);
      }
    } catch (error) {
      console.error("Error processing cancellation:", error);
      toast({
        title: "Error",
        description: "Failed to process cancellation",
        variant: "destructive",
      });
    }
  };

  const processRefund = async (ticketId: string, amount: string) => {
    try {
      await apiFetch(`/support/${ticketId}/process-refund`, {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(amount),
          reason: "Customer request via support ticket",
          refund_method: "original",
        }),
      });

      toast({
        title: "Success",
        description: "Refund processed successfully",
      });

      loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        loadTicketDetails(ticketId);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Technical Support</h1>
        <p className="text-gray-600">
          Manage support tickets, subscription cancellations, and refund requests
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.by_status.open}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.by_status.in_progress}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.by_status.resolved}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending_user">Pending User</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="subscription_cancellation">Subscription Cancellation</SelectItem>
                  <SelectItem value="refund_request">Refund Request</SelectItem>
                  <SelectItem value="billing_issue">Billing Issue</SelectItem>
                  <SelectItem value="technical_support">Technical Support</SelectItem>
                  <SelectItem value="account_issue">Account Issue</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  <SelectItem value="bug_report">Bug Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={loadTickets} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            Manage and respond to customer support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <Headphones className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No support tickets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons];
                return (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => loadTicketDetails(ticket.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-gray-600">
                            #{ticket.ticket_number}
                          </span>
                          <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[ticket.category as keyof typeof categoryLabels]}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.user?.name || 'Unknown User'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(ticket.createdAt, 'MMM dd, yyyy')}
                          </span>
                          {ticket.assignedAdmin && (
                            <span className="flex items-center gap-1">
                              <Settings className="h-3 w-3" />
                              Assigned to {ticket.assignedAdmin.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono">#{selectedTicket.ticket_number}</span>
                  <Badge className={statusColors[selectedTicket.status as keyof typeof statusColors]}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={priorityColors[selectedTicket.priority as keyof typeof priorityColors]}>
                    {selectedTicket.priority}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {categoryLabels[selectedTicket.category as keyof typeof categoryLabels]} • 
                  Created by {selectedTicket.user?.name || 'Unknown User'} • 
                  {formatDate(selectedTicket.createdAt, 'MMM dd, yyyy HH:mm')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Ticket Info */}
                <div>
                  <h3 className="font-semibold mb-2">{selectedTicket.subject}</h3>
                  <p className="text-gray-600 mb-4">{selectedTicket.description}</p>
                  
                  {selectedTicket.subscription && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Related Subscription:</strong> {selectedTicket.subscription.plan_id} 
                        (Status: {selectedTicket.subscription.status})
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending_user">Pending User</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedTicket.category === 'subscription_cancellation' && selectedTicket.subscription && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => processCancellation(selectedTicket.id, false)}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Schedule Cancellation
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => processCancellation(selectedTicket.id, true)}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Cancel Immediately
                      </Button>
                    </>
                  )}

                  {selectedTicket.category === 'refund_request' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const amount = prompt("Enter refund amount:");
                        if (amount) processRefund(selectedTicket.id, amount);
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Refund
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-semibold mb-3">Conversation</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTicket.messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.is_internal 
                            ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.sender?.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(message.createdAt, 'MMM dd, HH:mm')}
                          </span>
                          {message.is_internal && (
                            <Badge variant="outline" className="text-xs">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Message */}
                <div className="space-y-3">
                  <Label htmlFor="new-message">Add Message</Label>
                  <Textarea
                    id="new-message"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="internal"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="internal" className="text-sm">
                        Internal note (only visible to admins)
                      </Label>
                    </div>
                    <Button onClick={addMessage} disabled={!newMessage.trim()}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>

                {selectedTicket.resolution_notes && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-1">Resolution Notes</h5>
                    <p className="text-sm text-green-700">{selectedTicket.resolution_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
