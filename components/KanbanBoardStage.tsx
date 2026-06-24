'use client';

import React from 'react';

import { useDroppable } from '@dnd-kit/core';

export function KanbanBoardStage({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: '#f4f5f7',
        width: '250px',
        padding: '15px',
        borderRadius: '8px',
      }}
    >
      <h3>{title}</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minHeight: '200px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
