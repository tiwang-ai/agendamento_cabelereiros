import React from 'react';
import PlanManagement from '@/components/admin/PlanManagement';

export default function Plans() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <PlanManagement />
        </div>
      </div>
    </div>
  );
}