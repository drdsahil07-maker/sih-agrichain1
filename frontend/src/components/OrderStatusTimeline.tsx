import React from 'react';
import { CheckCircle2, Clock, Truck, Package, PackageCheck } from 'lucide-react';
import { motion } from 'motion/react';

const STATUS_STEPS = [
  'CREATED',
  'CONFIRMED',
  'POOLING',
  'TRANSPORT_ASSIGNED',
  'PICKUP_READY',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED'
];

interface OrderStatusTimelineProps {
  currentStatus: string;
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        This order has been cancelled.
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="relative py-4">
      {/* Background Line */}
      <div className="absolute top-8 left-4 right-4 h-1 bg-gray-200 rounded-full" />
      
      {/* Active Line */}
      <motion.div 
        className="absolute top-8 left-4 h-1 bg-green-500 rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ maxWidth: 'calc(100% - 2rem)' }}
      />

      <div className="relative flex justify-between">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 
                  ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                  ${isCurrent ? 'ring-4 ring-green-100' : ''}
                `}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <div className="mt-2 text-xs font-medium text-center text-gray-600 max-w-[60px] leading-tight">
                {step.replace(/_/g, ' ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
