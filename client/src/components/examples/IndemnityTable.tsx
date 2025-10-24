import IndemnityTable from '../IndemnityTable';

const mockIndemnityRecords = [
  {
    emp_id: "101",
    emp_name: "John Smith",
    designation: "Site Engineer",
    doj: "2023-01-15",
    years_of_service: 2,
    basic_salary: 4500,
    indemnity_amount: 9000,
    status: "Active" as const
  },
  {
    emp_id: "102",
    emp_name: "Sarah Johnson",
    designation: "HR Manager",
    doj: "2022-06-20",
    years_of_service: 2.5,
    basic_salary: 5200,
    indemnity_amount: 13000,
    status: "Active" as const
  },
];

export default function IndemnityTableExample() {
  return (
    <div className="p-6 bg-background">
      <IndemnityTable
        records={mockIndemnityRecords}
        onPay={(id) => console.log('Pay indemnity:', id)}
        onEdit={(record) => console.log('Edit:', record)}
      />
    </div>
  );
}
