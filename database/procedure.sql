

-- Viết truy vấn SQL cơ bản để thêm lịch khám
INSERT INTO LichKham (NgayKham, MaBacSi, MaBenhNhan, ChanDoan, GhiChu)
VALUES ('2025-10-07', 3, 45, N'Viêm họng cấp', N'Bệnh nhân ho nhiều, sốt nhẹ');
-- Tìm bác sĩ theo ngày.
SELECT DISTINCT b.MaBacSi, b.TenBacSi
FROM LichKham lk
JOIN BacSi b ON lk.MaBacSi = b.MaBacSi
WHERE lk.NgayKham = '2023-05-01';


-- Viết truy vấn JOIN để liệt kê bệnh nhân và thuốc được kê

SELECT 
    bn.MaBenhNhan,
    bn.TenBenhNhan,
    lk.NgayKham,
    lk.ChanDoan,
    t.TenThuoc,
    kt.SoLuong
FROM BenhNhan bn
JOIN LichKham lk ON bn.MaBenhNhan = lk.MaBenhNhan
JOIN KeThuoc kt ON lk.MaLichKham = kt.MaLichKham
JOIN Thuoc t ON kt.MaThuoc = t.MaThuoc
ORDER BY bn.MaBenhNhan, lk.NgayKham;

-- Tích hợp stored procedure tính chi phí khám
GO
CREATE PROCEDURE TinhChiPhiKham
    @MaLichKham INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongThuoc MONEY = 0;
    DECLARE @TongDichVu MONEY = 0;
    DECLARE @TongChiPhi MONEY = 0;

    -- Tính tổng tiền thuốc
    SELECT @TongThuoc = SUM(t.DonGia * kt.SoLuong)
    FROM KeThuoc kt
    JOIN Thuoc t ON kt.MaThuoc = t.MaThuoc
    WHERE kt.MaLichKham = @MaLichKham;

    -- Tính tổng tiền dịch vụ
    SELECT @TongDichVu = SUM(dv.DonGia * cd.SoLan)
    FROM ChiDinh cd
    JOIN DichVu dv ON cd.MaDichVu = dv.MaDichVu
    WHERE cd.MaLichKham = @MaLichKham;

    -- Tổng chi phí
    SET @TongChiPhi = ISNULL(@TongThuoc, 0) + ISNULL(@TongDichVu, 0);

    -- Xuất kết quả
    SELECT 
        @MaLichKham AS MaLichKham,
        @TongThuoc AS TongTienThuoc,
        @TongDichVu AS TongTienDichVu,
        @TongChiPhi AS TongChiPhi;
END;

-- trigger kiểm tra lịch trùng
GO
CREATE TRIGGER trg_CheckDuplicateLichKham
ON LichKham
FOR INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM LichKham lk
        JOIN INSERTED i ON lk.MaBacSi = i.MaBacSi AND lk.NgayKham = i.NgayKham
        WHERE lk.MaLichKham <> i.MaLichKham
    )
    BEGIN
        RAISERROR(N'Lịch khám bị trùng: Bác sĩ đã có lịch khám vào thời điểm này.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;

-- Cursor để in ra report


GO
CREATE PROCEDURE sp_BaoCaoLichKhamTheoMa
    @MaLichKham INT
AS
BEGIN
    DECLARE @NgayKham DATE,
            @TenBacSi NVARCHAR(100),
            @TenBenhNhan NVARCHAR(100),
            @ChanDoan NVARCHAR(255),
            @GhiChu NVARCHAR(255),
            @TongChiPhi MONEY = 0;

    -- Lấy thông tin lịch khám
    SELECT 
        @NgayKham = lk.NgayKham,
        @TenBacSi = bs.TenBacSi,
        @TenBenhNhan = bn.TenBenhNhan,
        @ChanDoan = lk.ChanDoan,
        @GhiChu = lk.GhiChu
    FROM LichKham lk
    JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
    JOIN BenhNhan bn ON lk.MaBenhNhan = bn.MaBenhNhan
    WHERE lk.MaLichKham = @MaLichKham;

    PRINT '---------------------------------------------';
    PRINT N'🗓 Ngày khám: ' + CONVERT(NVARCHAR, @NgayKham, 103);
    PRINT N'👨‍⚕️ Bác sĩ: ' + @TenBacSi;
    PRINT N'🧍‍♂️ Bệnh nhân: ' + @TenBenhNhan;
    PRINT N'📋 Chẩn đoán: ' + @ChanDoan;
    PRINT N'📝 Ghi chú: ' + @GhiChu;

    PRINT N'🔬 Danh sách chỉ định dịch vụ:';
    DECLARE @TenDichVu NVARCHAR(100), @SoLan INT;
    DECLARE DvCursor CURSOR FOR
    SELECT dv.TenDichVu, cd.SoLan
    FROM ChiDinh cd
    JOIN DichVu dv ON cd.MaDichVu = dv.MaDichVu
    WHERE cd.MaLichKham = @MaLichKham;

    OPEN DvCursor;
    FETCH NEXT FROM DvCursor INTO @TenDichVu, @SoLan;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT N'- ' + @TenDichVu + N': ' + CAST(@SoLan AS NVARCHAR) + N' lần';
        FETCH NEXT FROM DvCursor INTO @TenDichVu, @SoLan;
    END
    CLOSE DvCursor;
    DEALLOCATE DvCursor;

    PRINT N'💊 Danh sách thuốc kê:';
    DECLARE @TenThuoc NVARCHAR(100), @SoLuong INT;
    DECLARE ThuocCursor CURSOR FOR
    SELECT t.TenThuoc, kt.SoLuong
    FROM KeThuoc kt
    JOIN Thuoc t ON kt.MaThuoc = t.MaThuoc
    WHERE kt.MaLichKham = @MaLichKham;

    OPEN ThuocCursor;
    FETCH NEXT FROM ThuocCursor INTO @TenThuoc, @SoLuong;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT N'- ' + @TenThuoc + N': ' + CAST(@SoLuong AS NVARCHAR) + N' viên';
        FETCH NEXT FROM ThuocCursor INTO @TenThuoc, @SoLuong;
    END
    CLOSE ThuocCursor;
    DEALLOCATE ThuocCursor;

    -- Tính tổng chi phí
    SELECT @TongChiPhi = ISNULL(SUM(kt.SoLuong * t.DonGia), 0)
    FROM KeThuoc kt
    JOIN Thuoc t ON kt.MaThuoc = t.MaThuoc
    WHERE kt.MaLichKham = @MaLichKham;

    SELECT @TongChiPhi = @TongChiPhi + ISNULL(SUM(cd.SoLan * dv.DonGia), 0)
    FROM ChiDinh cd
    JOIN DichVu dv ON cd.MaDichVu = dv.MaDichVu
    WHERE cd.MaLichKham = @MaLichKham;

    PRINT N'💰 Tổng chi phí: ' + FORMAT(@TongChiPhi, 'N0') + N' VND';
END;
GO
CREATE PROCEDURE sp_DangKyLichKham
    @MaBacSi INT,
    @TenBenhNhan NVARCHAR(100),
    @NgaySinh DATE,
    @GioiTinh NVARCHAR(10),
    @DiaChi NVARCHAR(200) = NULL,
    @NgayKham DATE,
    @GhiChu NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaBenhNhan INT;

    -- Kiểm tra tồn tại bác sĩ
    IF NOT EXISTS (SELECT 1 FROM BacSi WHERE MaBacSi = @MaBacSi)
    BEGIN
        RAISERROR(N'Bác sĩ không tồn tại.', 16, 1);
        RETURN;
    END

    -- Kiểm tra bệnh nhân đã có chưa (trùng tên + ngày sinh + giới tính)
    SELECT @MaBenhNhan = MaBenhNhan
    FROM BenhNhan
    WHERE TenBenhNhan = @TenBenhNhan AND NgaySinh = @NgaySinh AND GioiTinh = @GioiTinh;

    -- Nếu chưa có thì thêm mới bệnh nhân
    IF @MaBenhNhan IS NULL
    BEGIN
        INSERT INTO BenhNhan (TenBenhNhan, NgaySinh, GioiTinh, DiaChi)
        VALUES (@TenBenhNhan, @NgaySinh, @GioiTinh, @DiaChi);

        SET @MaBenhNhan = SCOPE_IDENTITY();
    END

    -- Thêm lịch khám
    INSERT INTO LichKham (NgayKham, MaBacSi, MaBenhNhan, GhiChu)
    VALUES (@NgayKham, @MaBacSi, @MaBenhNhan, @GhiChu);
END;
GO
CREATE TYPE ThuocTableType AS TABLE (
    MaThuoc INT,
    SoLuong INT
);
GO
CREATE TYPE DichVuTableType AS TABLE (
    MaDichVu INT,
    SoLan INT
);
GO
CREATE PROCEDURE CapNhatLichKhamVaChiTiet
(
    @MaLichKham INT,
    @ChanDoan NVARCHAR(255),
    @GhiChu NVARCHAR(255),
    @Thuoc ThuocTableType READONLY,
    @DichVu DichVuTableType READONLY
)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Cập nhật chẩn đoán và ghi chú
        UPDATE LichKham
        SET ChanDoan = @ChanDoan,
            GhiChu = @GhiChu
        WHERE MaLichKham = @MaLichKham;

        -- Xóa thuốc cũ
        DELETE FROM KeThuoc WHERE MaLichKham = @MaLichKham;

        -- Thêm thuốc mới
        INSERT INTO KeThuoc (MaLichKham, MaThuoc, SoLuong)
        SELECT @MaLichKham, MaThuoc, SoLuong FROM @Thuoc;

        -- Xóa dịch vụ cũ
        DELETE FROM ChiDinh WHERE MaLichKham = @MaLichKham;

        -- Thêm dịch vụ mới
        INSERT INTO ChiDinh (MaLichKham, MaDichVu, SoLan)
        SELECT @MaLichKham, MaDichVu, SoLan FROM @DichVu;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Ném lỗi ra ngoài
        THROW;
    END CATCH
END;
GO;
CREATE PROCEDURE sp_DangKyLichKhamTheoBenhNhan
    @MaBenhNhan INT,
    @MaBacSi INT,
    @NgayKham DATE,
    @ChanDoan NVARCHAR(255) = NULL,
    @GhiChu NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra tồn tại Bệnh nhân
    IF NOT EXISTS (SELECT 1 FROM BenhNhan WHERE MaBenhNhan = @MaBenhNhan)
    BEGIN
        RAISERROR('Bệnh nhân không tồn tại.', 16, 1);
        RETURN;
    END

    -- Kiểm tra tồn tại Bác sĩ
    IF NOT EXISTS (SELECT 1 FROM BacSi WHERE MaBacSi = @MaBacSi)
    BEGIN
        RAISERROR('Bác sĩ không tồn tại.', 16, 1);
        RETURN;
    END

    -- Thêm lịch khám mới
    INSERT INTO LichKham (NgayKham, MaBacSi, MaBenhNhan, ChanDoan, GhiChu)
    VALUES (@NgayKham, @MaBacSi, @MaBenhNhan, @ChanDoan, @GhiChu);

    -- Trả về ID lịch khám vừa tạo
    SELECT SCOPE_IDENTITY() AS MaLichKham;
END
GO

