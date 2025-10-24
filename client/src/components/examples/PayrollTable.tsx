import PayrollTable from '../PayrollTable';

const mockPayrollData = [
  {
    emp_id: "101",
    name: "John Smith",
    designation: "Site Engineer",
    worked_days: 26,
    salary_earned: 4500,
    fot_earned: 150,
    hot_earned: 75,
    food_allow: 260,
    allow_other: 0,
    not_earned: 0,
    deductions: 0,
    total_earnings: 4985,
    comment: ""
  },
  {
    emp_id: "102",
    name: "Sarah Johnson",
    designation: "HR Manager",
    worked_days: 24,
    salary_earned: 4800,
    fot_earned: 0,
    hot_earned: 120,
    food_allow: 240,
    allow_other: 100,
    not_earned: 400,
    deductions: 50,
    total_earnings: 4810,
    comment: "Advanced payment deducted"
  }
];

export default function PayrollTableExample() {
  return (
    <div className="p-6 bg-background">
      <PayrollTable
        data={mockPayrollData}
        onSave={(data) => console.log('Save:', data)}
        onApprove={(data) => console.log('Approve:', data)}
      />
    </div>
  );
}
