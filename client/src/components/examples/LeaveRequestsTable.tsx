import LeaveRequestsTable from '../LeaveRequestsTable';

const mockRequests = [
  {
    id: "LR-001",
    emp_id: "101",
    emp_name: "John Smith",
    leave_type: "annual",
    start_date: "2025-02-01",
    end_date: "2025-02-05",
    days: 5,
    reason: "Family vacation",
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
    reason: "Medical appointment",
    status: "Approved" as const,
    submitted_at: "2025-01-24"
  },
];

export default function LeaveRequestsTableExample() {
  return (
    <div className="p-6 bg-background">
      <LeaveRequestsTable
        requests={mockRequests}
        onApprove={(id) => console.log('Approve:', id)}
        onReject={(id) => console.log('Reject:', id)}
        onView={(req) => console.log('View:', req)}
      />
    </div>
  );
}
