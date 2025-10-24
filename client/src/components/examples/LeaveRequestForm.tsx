import LeaveRequestForm from '../LeaveRequestForm';

export default function LeaveRequestFormExample() {
  return (
    <div className="p-6 bg-background max-w-2xl">
      <LeaveRequestForm
        onSubmit={(data) => console.log('Leave request:', data)}
        onCancel={() => console.log('Cancelled')}
      />
    </div>
  );
}
