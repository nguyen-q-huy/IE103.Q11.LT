'use client';

import BenhNhanForm from '@components/chitietbenhnhan';
import DanhSachLichKham from '@components/lichkhambenhnhan';
import { use } from 'react';

interface PageProps {
  params: { id: string };
}

export default function UpdateBenhNhanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 border-b pb-2 mb-6">
        🧾 Chi tiết bệnh nhân
      </h1>

      <BenhNhanForm id={parseInt(id, 10)} />

      <DanhSachLichKham maBenhNhan={parseInt(id, 10)} />
    </div>
  );
}
