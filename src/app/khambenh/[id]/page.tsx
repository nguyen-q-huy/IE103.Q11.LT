import { notFound } from 'next/navigation';
import ChiTietKham from '@components/chitietkham';
import ChiTietKhamForm from '@components/chitietkhamForm';

export default async function ChiTietKhamPage(props: any) {
    const { params } = props;
    const { id } = params;

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 border-b pb-2 mb-6">
                🧾 Chi tiết khám bệnh
            </h1>
            <div>
                <ChiTietKham maLichKham={Number(id)} />
                <ChiTietKhamForm maLichKham={Number(id)} />
            </div>
        </div >
    );
}
