import DashboardTile from '../DashboardTile';
import { Upload } from 'lucide-react';

export default function DashboardTileExample() {
  return (
    <div className="p-6 bg-background">
      <DashboardTile
        title="Upload Attendance"
        icon={Upload}
        description="Import monthly attendance data"
        onClick={() => console.log('Upload Attendance clicked')}
      />
    </div>
  );
}
