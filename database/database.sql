

-- Tạo CSDL
USE MASTER;
GO
DROP DATABASE  QLBenhVien;
GO
CREATE DATABASE QLBenhVien;
GO

-- Sử dụng CSDL
USE QLBenhVien;
GO

-- Bảng Bệnh nhân
CREATE TABLE BenhNhan (
    MaBenhNhan INT IDENTITY(1,1) PRIMARY KEY,
    TenBenhNhan NVARCHAR(100),
    NgaySinh DATE,
    GioiTinh NVARCHAR(10),
    DiaChi NVARCHAR(200)	
);

-- Bảng Bác sĩ
CREATE TABLE BacSi (
    MaBacSi INT IDENTITY(1,1) PRIMARY KEY,
    TenBacSi NVARCHAR(100)
);

-- Bảng Loại Dịch Vụ
CREATE TABLE LoaiDichVu (
    MaLoaiDichVu INT IDENTITY(1,1) PRIMARY KEY,
    TenLoaiDichVu NVARCHAR(100),
    MoTa NVARCHAR(255)
);

-- Bảng Dịch vụ
CREATE TABLE DichVu (
    MaDichVu INT IDENTITY(1,1) PRIMARY KEY,
    TenDichVu NVARCHAR(100),
    DonGia DECIMAL(10,2),
    MaLoaiDichVu INT,
    MoTa NVARCHAR(255),
    FOREIGN KEY (MaLoaiDichVu) REFERENCES LoaiDichVu(MaLoaiDichVu)
);

-- Bảng Thuốc
CREATE TABLE Thuoc (
    MaThuoc INT IDENTITY(1,1) PRIMARY KEY,
    TenThuoc NVARCHAR(100),
    DonGia DECIMAL(10,2),
    DonVi NVARCHAR(50),
    HamLuong NVARCHAR(50),
    Chat NVARCHAR(50),
    DangBaoChe NVARCHAR(50)
);

-- Bảng Lịch khám
CREATE TABLE LichKham (
    MaLichKham INT IDENTITY(1,1) PRIMARY KEY,
    NgayKham DATE,
    MaBacSi INT,
    MaBenhNhan INT,
	ChanDoan NVARCHAR(255),
    GhiChu NVARCHAR(255),
    FOREIGN KEY (MaBacSi) REFERENCES BacSi(MaBacSi),
    FOREIGN KEY (MaBenhNhan) REFERENCES BenhNhan(MaBenhNhan)
);

-- Bảng Kê thuốc
CREATE TABLE KeThuoc (
    MaLichKham INT,
    MaThuoc INT,
    SoLuong INT,
    PRIMARY KEY (MaLichKham, MaThuoc),
    FOREIGN KEY (MaLichKham) REFERENCES LichKham(MaLichKham),
    FOREIGN KEY (MaThuoc) REFERENCES Thuoc(MaThuoc)
);

-- Bảng Chỉ định dịch vụ
CREATE TABLE ChiDinh (
    MaLichKham INT,
    MaDichVu INT,
    SoLan INT,
    PRIMARY KEY (MaLichKham, MaDichVu),
    FOREIGN KEY (MaLichKham) REFERENCES LichKham(MaLichKham),
    FOREIGN KEY (MaDichVu) REFERENCES DichVu(MaDichVu)
);

GO
------------------------------------------------------------------------------------------
INSERT INTO Thuoc (TenThuoc, DonGia, DonVi, HamLuong, Chat, DangBaoChe)
VALUES
(N'Paracetamol', 1500, N'viên', N'500mg', N'Acetaminophen', N'Viên nén'),
(N'Amoxicillin', 2500, N'viên', N'500mg', N'Penicillin', N'Viên nang'),
(N'Cefuroxime', 3500, N'viên', N'500mg', N'Cephalosporin', N'Viên nén'),
(N'Ciprofloxacin', 3000, N'viên', N'500mg', N'Quinolone', N'Viên nén'),
(N'Metronidazole', 2000, N'viên', N'400mg', N'Nitroimidazole', N'Viên nén'),
(N'Omeprazole', 1800, N'viên', N'20mg', N'Benzimidazole', N'Viên nang'),
(N'Ranitidine', 1700, N'viên', N'150mg', N'H2-blocker', N'Viên nén'),
(N'Ibuprofen', 1600, N'viên', N'400mg', N'NSAID', N'Viên nén'),
(N'Diclofenac', 1900, N'viên', N'50mg', N'NSAID', N'Viên nén'),
(N'Aspirin', 1200, N'viên', N'81mg', N'Salicylate', N'Viên nén'),
(N'Atorvastatin', 2200, N'viên', N'10mg', N'Statin', N'Viên nén'),
(N'Losartan', 2100, N'viên', N'50mg', N'ARB', N'Viên nén'),
(N'Amlodipine', 2000, N'viên', N'5mg', N'Calcium blocker', N'Viên nén'),
(N'Furosemide', 1800, N'viên', N'40mg', N'Loop diuretic', N'Viên nén'),
(N'Insulin', 50000, N'ống', N'100IU/ml', N'Hormone', N'Dung dịch tiêm'),
(N'Metformin', 1700, N'viên', N'500mg', N'Biguanide', N'Viên nén'),
(N'Salbutamol', 25000, N'bình', N'100mcg/liều', N'Beta-agonist', N'Xịt hít'),
(N'Prednisolone', 1600, N'viên', N'5mg', N'Corticosteroid', N'Viên nén'),
(N'Clopidogrel', 2800, N'viên', N'75mg', N'Thienopyridine', N'Viên nén'),
(N'Vitamin B1, B6, B12', 1500, N'viên', N'250mg/250mg/1mg', N'Vitamin tổng hợp', N'Viên nén');

INSERT INTO LoaiDichVu (TenLoaiDichVu, MoTa)
VALUES
(N'Xét nghiệm', N'Dịch vụ xét nghiệm máu, nước tiểu, sinh hóa'),
(N'Chẩn đoán hình ảnh', N'Chụp X-quang, CT, MRI, siêu âm'),
(N'Khám chuyên khoa', N'Khám nội, ngoại, sản, nhi, mắt, tai mũi họng'),
(N'Thủ thuật', N'Thực hiện các thủ thuật nhỏ như tiểu phẫu, nội soi'),
(N'Điều trị phục hồi', N'Vật lý trị liệu, phục hồi chức năng'),
(N'Tư vấn sức khỏe', N'Tư vấn dinh dưỡng, tâm lý, lối sống'),
(N'Khám tổng quát', N'Gói khám sức khỏe định kỳ tổng quát'),
(N'Tiêm chủng', N'Tiêm vaccine phòng bệnh');

INSERT INTO DichVu (TenDichVu, DonGia, MaLoaiDichVu, MoTa)
VALUES
-- Xét nghiệm (MaLoaiDichVu = 1)
(N'Xét nghiệm máu tổng quát', 120000, 1, N'Kiểm tra các chỉ số máu cơ bản'),
(N'Xét nghiệm sinh hóa máu', 150000, 1, N'Đánh giá chức năng gan, thận'),
(N'Xét nghiệm nước tiểu', 80000, 1, N'Phân tích thành phần nước tiểu'),
(N'Xét nghiệm đường huyết', 50000, 1, N'Kiểm tra lượng glucose trong máu'),
(N'Xét nghiệm mỡ máu', 100000, 1, N'Đánh giá cholesterol và triglyceride'),
(N'Xét nghiệm HIV', 90000, 1, N'Tầm soát virus HIV'),
(N'Xét nghiệm viêm gan B', 95000, 1, N'Tầm soát virus HBV'),
(N'Xét nghiệm viêm gan C', 95000, 1, N'Tầm soát virus HCV'),
(N'Xét nghiệm CRP', 85000, 1, N'Đánh giá phản ứng viêm'),
(N'Xét nghiệm đông máu', 110000, 1, N'Kiểm tra khả năng đông máu'),

-- Chẩn đoán hình ảnh (MaLoaiDichVu = 2)
(N'Chụp X-quang phổi', 180000, 2, N'Phát hiện tổn thương phổi'),
(N'Chụp X-quang xương', 160000, 2, N'Kiểm tra gãy xương'),
(N'Siêu âm bụng tổng quát', 200000, 2, N'Đánh giá gan, thận, tụy, lách'),
(N'Siêu âm tuyến giáp', 170000, 2, N'Kiểm tra tuyến giáp'),
(N'Siêu âm thai', 150000, 2, N'Theo dõi sự phát triển thai nhi'),
(N'Chụp CT sọ não', 800000, 2, N'Phát hiện tổn thương não'),
(N'Chụp CT ngực', 850000, 2, N'Đánh giá tổn thương phổi'),
(N'Chụp MRI cột sống', 1200000, 2, N'Phát hiện thoát vị đĩa đệm'),
(N'Chụp MRI não', 1300000, 2, N'Đánh giá tổn thương thần kinh'),
(N'Đo điện tim (ECG)', 100000, 2, N'Kiểm tra hoạt động tim'),

-- Khám chuyên khoa (MaLoaiDichVu = 3)
(N'Khám nội tổng quát', 100000, 3, N'Khám các bệnh lý nội khoa'),
(N'Khám ngoại tổng quát', 100000, 3, N'Khám các bệnh ngoại khoa'),
(N'Khám sản phụ khoa', 120000, 3, N'Khám phụ nữ, thai sản'),
(N'Khám nhi khoa', 100000, 3, N'Khám trẻ em'),
(N'Khám mắt', 90000, 3, N'Kiểm tra thị lực, bệnh lý mắt'),
(N'Khám tai mũi họng', 90000, 3, N'Khám viêm tai, viêm xoang'),
(N'Khám da liễu', 95000, 3, N'Khám các bệnh ngoài da'),
(N'Khám răng hàm mặt', 95000, 3, N'Khám răng, lợi, hàm'),
(N'Khám tâm thần', 120000, 3, N'Đánh giá sức khỏe tâm thần'),
(N'Khám tiết niệu', 110000, 3, N'Khám hệ tiết niệu'),

-- Thủ thuật (MaLoaiDichVu = 4)
(N'Nội soi dạ dày', 600000, 4, N'Kiểm tra tổn thương dạ dày'),
(N'Nội soi đại tràng', 700000, 4, N'Kiểm tra tổn thương ruột già'),
(N'Tiểu phẫu u mềm', 500000, 4, N'Cắt bỏ u lành tính'),
(N'Chọc dịch màng phổi', 400000, 4, N'Lấy dịch xét nghiệm'),
(N'Đặt catheter tĩnh mạch', 350000, 4, N'Đặt đường truyền tĩnh mạch'),
(N'Rửa tai', 80000, 4, N'Làm sạch tai bị tắc'),
(N'Bóc tách móng', 300000, 4, N'Điều trị viêm móng'),
(N'Đốt điện u nhú', 250000, 4, N'Loại bỏ u nhú da'),
(N'Chích áp xe', 200000, 4, N'Xử lý ổ mủ dưới da'),
(N'Thay băng vết thương', 100000, 4, N'Sát trùng và thay băng'),

-- Điều trị phục hồi (MaLoaiDichVu = 5)
(N'Vật lý trị liệu cột sống', 250000, 5, N'Giảm đau, phục hồi vận động'),
(N'Tập phục hồi chức năng tay', 200000, 5, N'Tăng cường vận động tay'),
(N'Tập phục hồi chức năng chân', 200000, 5, N'Tăng cường vận động chân'),
(N'Điện xung trị liệu', 220000, 5, N'Giảm đau bằng điện xung'),
(N'Siêu âm trị liệu', 230000, 5, N'Giảm viêm bằng sóng siêu âm'),

-- Tư vấn sức khỏe (MaLoaiDichVu = 6)
(N'Tư vấn dinh dưỡng', 150000, 6, N'Lập kế hoạch ăn uống hợp lý'),
(N'Tư vấn tâm lý', 180000, 6, N'Hỗ trợ tinh thần, giảm stress'),
(N'Tư vấn lối sống lành mạnh', 120000, 6, N'Giảm nguy cơ bệnh mạn tính'),

-- Khám tổng quát (MaLoaiDichVu = 7)
(N'Gói khám sức khỏe cơ bản', 500000, 7, N'Tổng hợp xét nghiệm và khám lâm sàng'),
(N'Gói khám sức khỏe nâng cao', 1200000, 7, N'Bao gồm xét nghiệm, hình ảnh, chuyên khoa'),

-- Tiêm chủng (MaLoaiDichVu = 8)
(N'Tiêm vaccine cúm', 300000, 8, N'Phòng bệnh cúm mùa'),
(N'Tiêm vaccine viêm gan B', 350000, 8, N'Phòng bệnh viêm gan siêu vi B'),
(N'Tiêm vaccine sởi - quai bị - rubella', 400000, 8, N'Phòng bệnh trẻ em'),
(N'Tiêm vaccine HPV', 800000, 8, N'Phòng ung thư cổ tử cung');

INSERT INTO BacSi (TenBacSi)
VALUES
(N'BS. Nguyễn Văn Minh - Nội tổng quát'),
(N'BS. Trần Thị Lan - Sản phụ khoa'),
(N'BS. Lê Văn Hùng - Ngoại tổng quát'),
(N'BS. Phạm Thị Mai - Nhi khoa'),
(N'BS. Hoàng Văn Quân - Tai Mũi Họng'),
(N'BS. Đỗ Thị Hạnh - Mắt'),
(N'BS. Vũ Văn Thành - Da liễu'),
(N'BS. Bùi Thị Ngọc - Tâm thần'),
(N'BS. Ngô Văn Dũng - Răng Hàm Mặt'),
(N'BS. Đặng Thị Thu - Tiết niệu');

DECLARE @i INT = 1;
WHILE @i <= 100
BEGIN
    INSERT INTO BenhNhan (TenBenhNhan, NgaySinh, GioiTinh, DiaChi)
    VALUES (
        -- Tên bệnh nhân: họ + tên đệm + tên chính theo giới tính
        CASE 
            WHEN @i % 2 = 0 THEN -- Nữ
                CONCAT(
                    CHOOSE(@i % 10 + 1, N'Nguyễn', N'Trần', N'Lê', N'Phạm', N'Hoàng', N'Đặng', N'Bùi', N'Đỗ', N'Vũ', N'Ngô'), N' Thị ',
                    CHOOSE(@i % 10 + 1, N'Mai', N'Hoa', N'Lan', N'Ngọc', N'Thủy', N'Tuyết', N'Hiền', N'Trinh', N'Phương', N'Yến')
                )
            ELSE -- Nam
                CONCAT(
                    CHOOSE(@i % 10 + 1, N'Nguyễn', N'Trần', N'Lê', N'Phạm', N'Hoàng', N'Đặng', N'Bùi', N'Đỗ', N'Vũ', N'Ngô'), N' Văn ',
                    CHOOSE(@i % 10 + 1, N'Nam', N'Hùng', N'Dũng', N'Tuấn', N'Hiếu', N'Khánh', N'Phúc', N'Thành', N'Lâm', N'Quang')
                )
        END,

        -- Ngày sinh: từ 1965 đến 2005
        DATEADD(YEAR, -20 - (@i % 40), GETDATE()),

        -- Giới tính
        CASE WHEN @i % 2 = 0 THEN N'Nữ' ELSE N'Nam' END,

        -- Địa chỉ: phường và quận tại TP.HCM
        CONCAT(N'Phường ', (@i % 20 + 1), N', Quận ', (@i % 10 + 1), N', TP.HCM')
    );
    SET @i = @i + 1;
END;

DECLARE @j INT = 1;
WHILE @j <= 500
BEGIN
    DECLARE @MaBenhNhan INT = (SELECT TOP 1 MaBenhNhan FROM BenhNhan ORDER BY NEWID());
    DECLARE @MaBacSi INT = (SELECT TOP 1 MaBacSi FROM BacSi ORDER BY NEWID());
    DECLARE @NgayKham DATE = DATEADD(DAY, -ABS(CHECKSUM(NEWID()) % 1000), GETDATE());

    DECLARE @TenBacSi NVARCHAR(100) = (SELECT TenBacSi FROM BacSi WHERE MaBacSi = @MaBacSi);
    DECLARE @ChanDoan NVARCHAR(255);
    DECLARE @GhiChu NVARCHAR(255);

    -- Chẩn đoán theo chuyên khoa bác sĩ
    SET @ChanDoan = CASE
        WHEN @TenBacSi LIKE N'%Nội tổng quát%' THEN CHOOSE(@j % 3 + 1, N'Cao huyết áp', N'Tiểu đường tuýp 2', N'Rối loạn tiêu hóa')
        WHEN @TenBacSi LIKE N'%Sản phụ khoa%' THEN CHOOSE(@j % 2 + 1, N'Thiếu máu thai kỳ', N'Rối loạn nội tiết')
        WHEN @TenBacSi LIKE N'%Ngoại tổng quát%' THEN CHOOSE(@j % 2 + 1, N'Đau lưng mãn tính', N'Viêm ruột thừa nhẹ')
        WHEN @TenBacSi LIKE N'%Nhi khoa%' THEN CHOOSE(@j % 2 + 1, N'Cảm cúm', N'Rối loạn tiêu hóa trẻ em')
        WHEN @TenBacSi LIKE N'%Tai Mũi Họng%' THEN CHOOSE(@j % 2 + 1, N'Viêm họng cấp', N'Viêm xoang')
        WHEN @TenBacSi LIKE N'%Mắt%' THEN N'Khô mắt mãn tính'
        WHEN @TenBacSi LIKE N'%Da liễu%' THEN N'Viêm da dị ứng'
        WHEN @TenBacSi LIKE N'%Tâm thần%' THEN N'Rối loạn lo âu nhẹ'
        WHEN @TenBacSi LIKE N'%Răng Hàm Mặt%' THEN N'Viêm lợi'
        WHEN @TenBacSi LIKE N'%Tiết niệu%' THEN N'Viêm đường tiết niệu'
        ELSE N'Khám tổng quát'
    END;

    SET @GhiChu = CONCAT(N'TT ổn định. Theo dõi thêm. ', @ChanDoan);

    -- Thêm lịch khám
    INSERT INTO LichKham (NgayKham, MaBacSi, MaBenhNhan, ChanDoan, GhiChu)
    VALUES (@NgayKham, @MaBacSi, @MaBenhNhan, @ChanDoan, @GhiChu);

    DECLARE @MaLichKham INT = SCOPE_IDENTITY();

    -- Kê thuốc phù hợp với chẩn đoán
    INSERT INTO KeThuoc (MaLichKham, MaThuoc, SoLuong)
    SELECT TOP (1 + @j % 2) @MaLichKham, MaThuoc, 10 + (@j % 4) * 5
    FROM Thuoc
    WHERE TenThuoc LIKE CASE
        WHEN @ChanDoan LIKE N'%viêm họng%' OR @ChanDoan LIKE N'%cúm%' THEN N'%Paracetamol%'
        WHEN @ChanDoan LIKE N'%dạ dày%' OR @ChanDoan LIKE N'%ruột%' THEN N'%Omeprazole%'
        WHEN @ChanDoan LIKE N'%huyết áp%' THEN N'%Amlodipine%'
        WHEN @ChanDoan LIKE N'%tiểu đường%' THEN N'%Metformin%'
        WHEN @ChanDoan LIKE N'%viêm da%' THEN N'%Cetirizine%'
        WHEN @ChanDoan LIKE N'%lo âu%' THEN N'%Fluoxetine%'
        WHEN @ChanDoan LIKE N'%viêm lợi%' THEN N'%Amoxicillin%'
        WHEN @ChanDoan LIKE N'%tiết niệu%' THEN N'%Furosemide%'
        ELSE N'%Paracetamol%'
	END
    ORDER BY NEWID();

    -- Chỉ định dịch vụ phù hợp với chẩn đoán
    INSERT INTO ChiDinh (MaLichKham, MaDichVu, SoLan)
    SELECT TOP (1 + @j % 2) @MaLichKham, MaDichVu, 1
    FROM DichVu
    WHERE TenDichVu LIKE CASE
        WHEN @ChanDoan LIKE N'%viêm họng%' OR @ChanDoan LIKE N'%cúm%' THEN N'%Xét nghiệm máu%'
        WHEN @ChanDoan LIKE N'%dạ dày%' OR @ChanDoan LIKE N'%ruột%' THEN N'%Nội soi%'
        WHEN @ChanDoan LIKE N'%huyết áp%' THEN N'%Điện tim%'
        WHEN @ChanDoan LIKE N'%tiểu đường%' THEN N'%Xét nghiệm đường huyết%'
        WHEN @ChanDoan LIKE N'%viêm da%' THEN N'%Soi da%'
        WHEN @ChanDoan LIKE N'%lo âu%' THEN N'%Tư vấn tâm lý%'
        WHEN @ChanDoan LIKE N'%viêm lợi%' THEN N'%Khám răng hàm mặt%'
        WHEN @ChanDoan LIKE N'%tiết niệu%' THEN N'%Siêu âm hệ tiết niệu%'
        ELSE N'%Khám tổng quát%'
	END
    ORDER BY NEWID();

    SET @j = @j + 1;
END;