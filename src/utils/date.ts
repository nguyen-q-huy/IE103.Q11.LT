
export function getToday(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('vi-VN').format(date); // => 15/10/2025
}

export function tinhTuoi(ngaySinhStr: string): number {
  if (!ngaySinhStr) return 0;
  const ngaySinh = new Date(ngaySinhStr);
  if (isNaN(ngaySinh.getTime())) return 0;

  const ngayHienTai = new Date();
  let tuoi = ngayHienTai.getFullYear() - ngaySinh.getFullYear();

  const chuaSinhNhat =
    ngayHienTai.getMonth() < ngaySinh.getMonth() ||
    (ngayHienTai.getMonth() === ngaySinh.getMonth() &&
      ngayHienTai.getDate() < ngaySinh.getDate());

  if (chuaSinhNhat) {
    tuoi -= 1;
  }

  return tuoi;
}
