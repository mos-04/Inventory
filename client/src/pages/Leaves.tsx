import { useState } from "react";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import LeaveRequestsTable from "@/components/LeaveRequestsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mockLeaveRequests = [
  {
    id: "LR-001",
    emp_id: "101",
    emp_name: "John Smith",
    leave_type: "annual",
    start_date: "2025-02-01",
    end_date: "2025-02-05",
    days: 5,
    reason: "Family vacation planned for next month",
    status: "Pending" as const,
    submitted_at: "2025-01-20"
  },
  {
    id: "LR-002",
    emp_id: "102",
    emp_name: "Sarah Johnson",
    leave_type: "sick",
    start_date: "2025-01-25",
    end_date: "2025-01-26",
    days: 2,
    reason: "Medical appointment and recovery",
    status: "Approved" as const,
    submitted_at: "2025-01-24"
  },
  {
    id: "LR-003",
    emp_id: "103",
    emp_name: "Ahmed Ali",
    leave_type: "emergency",
    start_date: "2025-01-28",
    end_date: "2025-01-29",
    days: 2,
    reason: "Family emergency - urgent travel required",
    status: "Pending" as const,
    submitted_at: "2025-01-27"
  },
  {
    id: "LR-004",
    emp_id: "104",
    emp_name: "Maria Garcia",
    leave_type: "annual",
    start_date: "2025-01-15",
    end_date: "2025-01-18",
    days: 4,
    reason: "Personal trip - already returned",
    status: "Rejected" as const,
    submitted_at: "2025-01-10"
  },
];

export default function Leaves() {
  const [requests, setRequests] = useState(mockLeaveRequests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const handleApprove = (id: string) => {
    console.log("Approve leave:", id);
    setRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: "Approved" as const } : req)
    );
  };

  const handleReject = (id: string) => {
    console.log("Reject leave:", id);
    setRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status: "Rejected" as const } : req)
    );
  };

  const handleView = (request: any) => {
    console.log("View request:", request);
    setSelectedRequest(request);
  };

  const handleSubmit = (data: any) => {
    console.log("New leave request:", data);
    const newRequest = {
      id: `LR-${String(requests.length + 1).padStart(3, '0')}`,
      emp_id: "101",
      emp_name: "Current User",
      leave_type: data.leaveType,
      start_date: new Date(data.startDate).toLocaleDateString(),
      end_date: new Date(data.endDate).toLocaleDateString(),
      days: Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      reason: data.reason,
      status: "Pending" as const,
      submitted_at: new Date().toLocaleDateString()
    };
    setRequests(prev => [newRequest, ...prev]);
    setIsDialogOpen(false);
  };

  const pendingRequests = requests.filter(r => r.status === "Pending");
  const approvedRequests = requests.filter(r => r.status === "Approved");
  const rejectedRequests = requests.filter(r => r.status === "Rejected");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage employee leave requests and approvals
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          data-testid="button-new-leave-request"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Leave Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Days Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.reduce((acc, r) => acc + r.days, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-leaves">
            All Requests ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending-leaves">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved-leaves">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected-leaves">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <LeaveRequestsTable
            requests={requests}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={handleView}
          />
        </TabsContent>

        <TabsContent value="pending">
          <LeaveRequestsTable
            requests={pendingRequests}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={handleView}
          />
        </TabsContent>

        <TabsContent value="approved">
          <LeaveRequestsTable
            requests={approvedRequests}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={handleView}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <LeaveRequestsTable
            requests={rejectedRequests}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={handleView}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
            <DialogDescription>
              Submit a new leave request for approval
            </DialogDescription>
          </DialogHeader>
          <LeaveRequestForm
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Request ID</p>
                  <p className="font-mono font-medium">{selectedRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">{selectedRequest.emp_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  <p className="font-medium capitalize">{selectedRequest.leave_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedRequest.days} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{selectedRequest.start_date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{selectedRequest.end_date}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Reason</p>
                <p className="text-sm border rounded-lg p-3 bg-muted/30">{selectedRequest.reason}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
